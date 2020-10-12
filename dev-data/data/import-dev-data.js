const fs= require('fs');
const Tour= require('../../models/tourModel');
const mongoose= require('mongoose');
const dotenv= require('dotenv');
dotenv.config({ path: './config.env' });

const DB= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true //Añadido porque me salía un DeprecationWarning
}).then(() => console.log('DB connection successful'));

// READ JSON FILE

const tours= JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// IMPORT DATA INTO DATABASE

const importData= async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION

const deleteData= async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if(process.argv[2] === '--import') { // node .\dev-data\data\import-dev-data.js --import
  importData();
} else if(process.argv[2] === '--delete') { // node .\dev-data\data\import-dev-data.js --delete
  deleteData();
}