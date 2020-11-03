const User= require('../models/userModel');
const catchAsync= require('../utils/catchAsync');
const AppError= require('../utils/appError');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

const filterObj= (obj, ...allowedFields) => {
  const newObj= {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el]= obj[el];
  });
  return newObj;
};

const getMe= (req, res, next) => {
  req.params.id= req.user.id;
  next();
};

const updateMe= catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates, please use /updatePassword', 400));
  }
  
  // 2) Filter out fields that are not allowed to be updated
  const filteredBody= filterObj(req.body, 'name', 'email');
  
  // 3) Update user document
  const updatedUser= await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe= catchAsync(async (req, res, next) => {
  const user= await User.findByIdAndUpdate(req.user.id, { active: false });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

const createUser= (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined, please use /signup instead'
  });
};

const getAllUsers= getAll(User);

const getUser= getOne(User);

// Do NOT update passwords with this
const updateUser= updateOne(User);

const deleteUser= deleteOne(User);

module.exports= {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
}