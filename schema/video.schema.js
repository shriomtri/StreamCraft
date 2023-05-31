const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  name: String,
  link: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
  },
  playlistUrl: String,
});

const VideoModel = mongoose.model('Video', videoSchema);

module.exports = {
  videoSchema,
  VideoModel
}