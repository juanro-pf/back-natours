const mongoose= require('mongoose');
const dotenv= require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION. Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require("./app");

const DB= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true //Añadido porque me salía un DeprecationWarning
}).then(() => console.log('DB connection successful'));

const port= process.env.PORT || 8000;
const server= app.listen(port, () => {
  console.groupCollapsed(`App running on port ${port}`);
});

// This handles all promises rejections unhandled
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION. Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});