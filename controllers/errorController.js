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

const sendErrorDev= (err, res) => {
  res. status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd= (err, res) => {
  // Operational (trusted) error
  if(err.isOperational) {
    res. status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

  // Programming or other error, DON'T send details to client
  } else {
    // Log the error
    console.error('ERROR', err);

    //Send generic message
    res. status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }

};

const globalErrorHandler= (err, req, res, next) => { //Al poner 4 parametros, express sabe que es una funcion de error handling
  err.statusCode= err.statusCode || 500;
  err.status= err.status || 'error';
  
  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if(process.env.NODE_ENV === 'production') {
    let error= {...err};

    if(error.kind === 'ObjectId') error= handleCastErrorDB(error);
    if(error.code === 11000) error= handleDuplicateFieldsErrorDB(error);
    if(error._message === 'Validation failed') error= handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
}

module.exports= globalErrorHandler;