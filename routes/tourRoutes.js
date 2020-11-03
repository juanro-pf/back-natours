const express= require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan }= require('../controllers/tourController');
const reviewRouter= require('../routes/reviewRoutes');

const router= express.Router();


// router.param('id', checkId);

// router.route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview)
router.use('/:tourId/reviews', reviewRouter) // En vez de lo de arriba

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)

router.route('/tour-stats').get(getTourStats)

router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)

router.route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour)

router.route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

module.exports= router;