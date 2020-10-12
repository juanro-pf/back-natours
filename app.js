const express= require('express');
const morgan= require('morgan');

const tourRouter= require('./routes/tourRoutes');
const userRouter= require('./routes/userRoutes');

const app= express();

// Middlewares

if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));// Morgan te regresa información de la llamada
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime= new Date().toISOString();
  next();
});

app.use((req, res, next) => {
  console.log('Hello from the meddleware');
  console.log(`Time: ${req.requestTime}`);
  next();
});

// Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports= app;