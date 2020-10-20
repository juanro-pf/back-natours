const User= require('../models/userModel');
const catchAsync= require('../utils/catchAsync');
const AppError= require('../utils/appError');

const getAllUsers= catchAsync(async (req, res, next) => {
  const users= await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

const getUser= (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented'
  });
};

const createUser= (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented'
  });
};

const updateUser= (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented'
  });
};

const deleteUser= (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented'
  });
};

module.exports= {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
}