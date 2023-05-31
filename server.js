const express = require('express');
const app = express();
const path = require('path');

require('./database').connectDb().finally(() => { });
const { generateAllSegments, outputDirectory } = require('./videoprocessor');

const PORT = 3000;
const { VideoModel } = require('./schema/video.schema');

app.use(express.json())
// Serve the manifest and segment files
app.use(express.static(path.join(__dirname, 'public')));

// Serve segment files with the appropriate MIME type
app.use('/segments', express.static(path.join(__dirname, 'segments'), { 'Content-Type': 'video/mp2t' }));

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

// Route to create a new video entity
app.post('/videos', async (req, res) => {
  try {
    const { name, link } = req.body;
  
    // Create a new video object
    const video = new VideoModel({
      name,
      link,
      status: 'pending',
    });

    // Save the video object in the database
    await video.save();

    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).send('Error creating video');
  }
});

// Handle the route to initiate segment generation
app.get('/process', async (req, res) => {
  try {
    // Get the pending videos from the database
    const videos = await VideoModel.find({ status: 'pending' });

    // Process each video
    for (const video of videos) {
      // Update the status to 'processing'
      video.status = 'processing';
      await video.save();

      await generateAllSegments(video.link, video);

      // Update the playlist URL and status in the database
      video.playlistUrl = `http://localhost:${PORT}/stream/480p/320x240/playlist.m3u8`;
      video.status = 'completed';
      await video.save();
    }

    res.send('Video processing completed');
  } catch (error) {
    console.error('Error processing videos:', error);
    res.status(500).send('Error processing videos');
  }
});

app.get('/videos', async (req, res) => {
  const list = await VideoModel.find({}).lean();
  res.json(list);
})


app.post('/videos/process/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the video by ID
    const video = await VideoModel.findById(id);

    // Check if the video exists and is in pending status
    if (!video || video.status !== 'pending') {
      return res.status(404).send('Video not found or cannot be processed');
    }

    // Update the video status to 'processing'
    video.status = 'processing';
    await video.save();

    // Process the video
    await generateAllSegments(video.link, video);

    // Update the playlist URL and status in the database
    video.playlistUrl = `http://localhost:${PORT}/stream/1080p/320x240/playlist.m3u8`;
    video.status = 'completed';
    await video.save();

    res.json(video);
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).send('Error processing video');
  }
});

// Serve the HLS playlist and segment files
app.get('/stream/:resolution/:dimension/playlist.m3u8', async (req, res) => {
  const { resolution, dimension } = req.params;
  const playlistPath = path.join(outputDirectory, `playlist_${resolution}_${dimension}.m3u8`);

  try {
    const exists = require('fs').existsSync(playlistPath);
    if (!exists) {
      return res.status(404).send('Playlist not found');
    }

    // Return the playlist file
    res.sendFile(playlistPath);
  } catch (error) {
    console.error('Error retrieving playlist:', error);
    res.status(500).send('Error retrieving playlist');
  }
});


app.get('/stream/:resolution/:dimension/:segment', async (req, res) => {
  const { resolution, dimension, segment } = req.params;
  const segmentPath = path.join(outputDirectory, `${segment}`);

  try {
    const exists = require('fs').existsSync(segmentPath);
    if (!exists) {
      return res.status(404).send('Playlist not found');
    }

    // Return the segment file
    res.sendFile(segmentPath);
  } catch (error) {
    console.error('Error retrieving segment:', error);
    res.status(500).send('Error retrieving segment');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
