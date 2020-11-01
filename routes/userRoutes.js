const express= require('express');
const { signUp, login, forgotPassword, resetPassword, protect, updatePassword } = require('../controllers/authController');
const {getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, deleteMe}= require('../controllers/userController');

const router= express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/')
  .get(getAllUsers)
  .post(createUser)
  
router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser)

module.exports= router;