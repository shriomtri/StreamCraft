
const mongoose = require('mongoose');

function connectDb() {
  return new Promise((resolve, reject) => {
    //DATABASE CONNECTION
    mongoose.connect('mongodb://localhost:27017/video_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => {
        resolve('Connected to MongoDB')
        console.log('Connected to MongoDB');
      })
      .catch((error) => {
        reject(error)
        console.error('Failed to connect to MongoDB:', error);
      });

  })
}

module.exports = { connectDb };