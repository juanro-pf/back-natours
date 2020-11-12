const path= require('path');
const express= require('express');
const morgan= require('morgan');
const rateLimit= require('express-rate-limit');
const helmet= require('helmet');
const mongoSanitize= require('express-mongo-sanitize');
const xss= require('xss-clean');
const hpp= require('hpp');
const cookieParser= require('cookie-parser');

const AppError= require('./utils/appError');
const globalErrorHandler= require('./controllers/errorController');
const tourRouter= require('./routes/tourRoutes');
const userRouter= require('./routes/userRoutes');
const reviewRouter= require('./routes/reviewRoutes');
const bookingRouter= require('./routes/bookingRoutes');
const viewRouter= require('./routes/viewRoutes');

const app= express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middlewares
// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set secyrity HTTP headers
app.use(helmet());

// Development logging
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));// Morgan te regresa información de la llamada
}

// Limit requests from same IP
const limiter= rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour.'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
// app.use(express.json());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({
  extended: true,
  // limit: '10kb'
}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// ALVVVVVV con esa madre de NoSQL query injection, no me vine nada!!
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Test middleware
app.use((req, res, next) => {
  req.requestTime= new Date().toISOString();
  // console.log(req.cookies)
  next();
});

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // Cualquier argumento que le pases al next lo toma como error
  // Si se llama el next con error se pasa directo al middleware que maneja el error (4 argumentos)
});

app.use(globalErrorHandler);

module.exports= app;