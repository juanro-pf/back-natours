class APIFeatures {
  constructor(query, queryString) {
    this.query= query;
    this.queryString= queryString;
  }

  filter() {
    const queryObj= {...this.queryString};
    const excludedFields= ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering

    let queryStr= JSON.stringify(queryObj);
    queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // const query= await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
    // let query= Tour.find(JSON.parse(queryStr));
    this.query= this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if(this.queryString.sort) { // Para orden descendente sort=-price
      const sortBy= this.queryString.sort.split(',').join(' ');
      this.query= this.query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      this.query= this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if(this.queryString.fields) {
      const fields= this.queryString.fields.split(',').join(' ');
      this.query= this.query.select(fields);
    } else {
      this.query= this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page= this.queryString.page * 1 || 1;
    const limit= this.queryString.limit * 1 || 100;
    const skip= limit * (page - 1);

    this.query= this.query.skip(skip).limit(limit);

    return this;
  }
};

module.exports= APIFeatures;

// Antes de APIFeatures, getAllTours estaba asi:
/*
const getAllTours= async (req, res) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const queryObj= {...req.query};
    const excludedFields= ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering

    let queryStr= JSON.stringify(queryObj);
    queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // const query= await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
    let query= Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if(req.query.sort) { // Para orden descendente sort=-price
      const sortBy= req.query.sort.split(',').join(' ');
      query= query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      query= query.sort('-createdAt');
    }

    // 3) Field limiting
    if(req.query.fields) {
      const fields= req.query.fields.split(',').join(' ');
      query= query.select(fields);
    } else {
      query= query.select('-__v');
    }

    // 4) Pagination
    const page= req.query.page * 1 || 1;
    const limit= req.query.limit * 1 || 100;
    const skip= limit * (page - 1);

    query= query.skip(skip).limit(limit);

    if(req.query.page) {
      const numTours= await Tour.countDocuments();
      if(skip >= numTours) throw new Error('This page does not exist');
    }

    // EXECUTE QUERY
    const tours= await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};
*/