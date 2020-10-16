const catchAsync= fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
    // fn(req, res, next).catch(err => next(err)); // Same as above
  }
};

module.exports= catchAsync;