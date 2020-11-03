const Tour= require('../models/tourModel');
// const APIFeatures= require('../utils/apiFeatures');
const catchAsync= require('../utils/catchAsync');
// const AppError= require('../utils/appError');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');

const aliasTopTours= (req, res, next) => {
  req.query.limit= '5';
  req.query.sort= '-ratingsAverage,price';
  req.query.fields= 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours= getAll(Tour);

const getTour= getOne(Tour, { path: 'reviews' });

const createTour= createOne(Tour);

const updateTour= updateOne(Tour);

const deleteTour= deleteOne(Tour);

const getTourStats= catchAsync(async (req, res, next) => {
  const stats= await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null, //Para no dividir por grupos
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, //Suma 1 por cada tour
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

const getMonthlyPlan= catchAsync(async (req, res, next) => {
  const year= req.params.year * 1;

  const plan= await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    num: plan.length,
    data: {
      plan
    }
  });
});

module.exports= {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan
};