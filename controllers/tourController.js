const multer= require('multer');
const sharp= require('sharp');
const { request } = require('../app');
const Tour= require('../models/tourModel');
const AppError = require('../utils/appError');
// const APIFeatures= require('../utils/apiFeatures');
const catchAsync= require('../utils/catchAsync');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');

const multerStorage= multer.memoryStorage();

const multerFilter= (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please upload only images', 400), false);
  }
};

const upload= multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadTourImages= upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

const resizeTourImages= catchAsync(async (req, res, next) => {
  if(!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover= `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 1) Images
  req.body.images= [];
  await Promise.all(req.files.images.map(async (file, i) => {
    const filename= `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
  }));

  next();
});

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

const getToursWithin= catchAsync(async (req, res, next) => {
  const { distance, latlng, unit }= req.params;
  const [ lat, lng]= latlng.split(',');

  const radius= unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format latitude,longitude', 400));
  }

  const tours= await Tour.find({
    // To do geo spatial queries, index for attribute is needed (in this case for startLocation)
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

const getDistances= catchAsync(async (req, res, next) => {
  const { latlng, unit }= req.params;
  const [ lat, lng]= latlng.split(',');

  const multiplier= unit === 'mi' ? 0.000621371 : 0.001

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format latitude,longitude', 400));
  }

  const distances= await Tour.aggregate([
    {
      // Always needs to be the first one in the pipeline
      // At least one of the fields must contain a geo spatial index
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
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
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
};