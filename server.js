const express = require('express');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = 3000;

const inputFilePath = path.join(__dirname, 'input.mp4');;
const outputDirectory =  path.join(__dirname, 'segments');;
const segmentDuration = 4; // Segment duration in seconds

// Define the dimensions and resolutions
const dimensions = [
  { width: 320, height: 240 },
  // { width: 640, height: 480 },
  { width: 1280, height: 720 }
];

const resolutions = [
  '480p',
  // '720p',
  '1080p'
];

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Function to generate segments for a given dimension and resolution
function generateSegments(dimension, resolution, callback) {
  const segmentFileName = `segment_${resolution}_${dimension.width}x${dimension.height}.ts`;
  const segmentFilePath = path.join(outputDirectory, segmentFileName);

  ffmpeg(inputFilePath)
    .outputOptions('-map 0')
    .outputOptions(`-s ${dimension.width}x${dimension.height}`)
    .outputOptions('-c:v libx264')
    .outputOptions('-crf 23')
    .outputOptions('-preset medium')
    .outputOptions('-flags +cgop')
    .outputOptions(`-segment_time ${segmentDuration}`)
    .outputOptions('-g 30') // Set the keyframe interval
    .outputOptions(`-hls_time ${segmentDuration}`)
    .outputOptions('-hls_playlist_type vod')
    .outputOptions('-hls_segment_filename ' + path.join(outputDirectory, `segment_${resolution}_${dimension.width}x${dimension.height}_%03d.ts`))
    .output(path.join(outputDirectory, `playlist_${resolution}_${dimension.width}x${dimension.height}.m3u8`))
    .on('start', () => {
      console.log('Segment generation started');
    })
    .on('progress', (progress) => {
      console.log(`Segment generation progress: ${progress.percent}%`);
    })
    .on('error', (err) => {
      console.error('Error generating segment:', err);
      callback(err);
    })
    .on('end', () => {
      console.log(`Segments generated for ${dimension.width}x${dimension.height} (${resolution})`);
      callback(null);
    })
    .run();
}

// Generate segments for each dimension and resolution
function generateAllSegments(callback) {
  let totalSegments = dimensions.length * resolutions.length;
  let completedSegments = 0;

  const checkCompletion = () => {
    if (completedSegments === totalSegments) {
      console.log('All segments generated successfully');
      callback();
    }
  };

  for (const dimension of dimensions) {
    for (const resolution of resolutions) {
      generateSegments(dimension, resolution, (err) => {
        if (err) {
          console.error(`Error generating segments for ${dimension.width}x${dimension.height} (${resolution})`);
        } else {
          completedSegments++;
          checkCompletion();
        }
      });
    }
  }
}

// Serve the manifest and segment files
app.use(express.static(path.join(__dirname, 'public')));

// Serve segment files with the appropriate MIME type
app.use('/segments', express.static(path.join(__dirname, 'segments'), { 'Content-Type': 'video/mp2t' }));

// Handle the route to initiate segment generation
app.get('/process', (req, res) => {
  generateAllSegments(() => {
    res.send('Segment generation completed');
    // Perform any additional actions or update the front-end as needed
  });
});

// Serve the HLS playlist and segment files
app.get('/stream/:resolution/:dimension/playlist.m3u8', (req, res) => {
  const { resolution, dimension } = req.params;
  const playlistPath = path.join(outputDirectory, `playlist_${resolution}_${dimension}.m3u8`);
  console.log(playlistPath);
  res.sendFile(playlistPath);
});

app.get('/stream/:resolution/:dimension/:segment', (req, res) => {
  const { resolution, dimension, segment } = req.params;
  const segmentPath = path.join(outputDirectory, `${segment}`);
  res.sendFile(segmentPath);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
