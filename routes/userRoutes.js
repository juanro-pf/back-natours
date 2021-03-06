const express= require('express');
const { signUp, login, forgotPassword, resetPassword, protect, updatePassword, restrictTo, logout } = require('../controllers/authController');
const {getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto}= require('../controllers/userController');

const router= express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Middleware a las rutas que estén abajo de esto
router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/')
  .get(getAllUsers)
  .post(createUser)
  
router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser)

module.exports= router;