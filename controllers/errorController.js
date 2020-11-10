const { request } = require('../app');
const AppError= require('../utils/appError');

const handleCastErrorDB= err => {
  const message= `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB= err => {
  const message= `Duplicate field ${JSON.stringify(err.keyValue)}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB= err => {
  const errors= Object.values(err.errors).map(el => el.message);
  const message= `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError= () => new AppError('Invalid token', 401);

const handleJWTExpiredError= () => new AppError('Expired token', 401);

const sendErrorDev= (err, req, res) => {
  // API
  if(req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // RENDERED WEBSITE
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd= (err, req, res) => {
  // API
  if(req.originalUrl.startsWith('/api')) {
    // Operational (trusted) error
    if(err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other error, DON'T send details to client
    // Log the error
    console.error('ERROR', err);

    //Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
  // RENDERED WEBSITE
  if(err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });

  // Programming or other error, DON'T send details to client
  }
  // Log the error
  console.error('ERROR', err);

  //Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later'
  });
};

const globalErrorHandler= (err, req, res, next) => { //Al poner 4 parametros, express sabe que es una funcion de error handling
  err.statusCode= err.statusCode || 500;
  err.status= err.status || 'error';
  
  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if(process.env.NODE_ENV === 'production') {
    let error= {...err};
    error.message= err.message;

    if(error.kind === 'ObjectId') error= handleCastErrorDB(error);
    if(error.code === 11000) error= handleDuplicateFieldsErrorDB(error);
    if(error._message === 'Validation failed') error= handleValidationErrorDB(error);
    if(error.name === 'JsonWebTokenError') error= handleJWTError();
    if(error.name === 'TokenExpiredError') error= handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
}

module.exports= globalErrorHandler;