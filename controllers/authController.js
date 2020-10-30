const { promisify }= require('util');
const jwt= require('jsonwebtoken');
const User= require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError= require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken= id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const signUp= catchAsync(async (req, res, next) => {
  const newUser= await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token= signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

const login= catchAsync(async(req, res, next) => {
  const { email, password }= req.body;

  // 1) Check if email and password actually exist
  if(!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists and password is correct
  const user= await User.findOne({ email }).select('+password');

  if(!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is OK send the token
  const token= signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

const protect= catchAsync(async (req, res, next) => {
  let token;
  // 1) Get the token and check if it is there
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token= req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if(!token) {
    return next(new AppError('Please log in to get access', 401));
  }

  // 2) Verify token
  const decoded= await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser= await User.findById(decoded.id);
  if(!freshUser) {
    return next(new AppError('User from the token does not longer exist', 401));
  }

  // 4) Check if user changed password after the jwt was issued
  if(freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed, please log in again', 401));
  }

  // Grant access to protected route
  req.user= freshUser;
  next();
});

const restrictTo= (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  }
};

const forgotPassword= catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user= await User.findOne({ email: req.body.email });
  if(!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken= user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // 3) Send it to user's email
  const resetURL= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message= `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min).',
      message,
    });
  
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (error) {
    user.passwordResetToken= undefined;
    user.passwordResetExpires= undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email, please try again later.', 500));
  }
});

const resetPassword= (req, res, next) => {

};

module.exports= {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword
};