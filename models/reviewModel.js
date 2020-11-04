const { Schema, model }= require('mongoose');
const Tour= require('./tourModel');

const reviewSchema= new Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  // .populate({
  //   path: 'tour',
  //   select: 'name'
  // });
  next();
});

// We use statics because we use aggregate and we need to do this on the model ("this" points to the model)
reviewSchema.statics.calcAverageRatings= async function(tourId) {
  const stats= await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  let newStats= {};
  if(stats.length > 0) {
    newStats= {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    }
  } else {
    newStats= {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    }
  }
  await Tour.findByIdAndUpdate(tourId, newStats);
};

reviewSchema.post('save', function() {
  // "this" points to current review
  // "this.constructor" points to the model
  this.constructor.calcAverageRatings(this.tour); // Por qué aquí no se usa await??
});

// findByIdAndUpdate
// findByIdAndDelete
// Behind the scenes these 2 are findOneAnd
reviewSchema.pre(/^findOneAnd/, async function(next){
  // "this" is the query, to get the document await for...
  this.rev= await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function(){
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

const Review= model('Review', reviewSchema);

module.exports= Review;