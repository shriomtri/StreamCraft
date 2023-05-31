const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Define the dimensions and resolutions
const dimensions = [
  { width: 320, height: 240 },
  // { width: 640, height: 480 },
  // { width: 1280, height: 720 }
];

const resolutions = [
  '480p',
  // '720p',
  // '1080p'
];

const outputDirectory =  path.join(__dirname, 'segments');;
const segmentDuration = 10; // Segment duration in seconds

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}


// Function to generate segments for a given dimension and resolution
function generateSegments(videoLink, dimension, resolution, callback) {
  const segmentFileName = `segment_${resolution}_${dimension.width}x${dimension.height}_%03d.ts`;
  const segmentFilePath = path.join(outputDirectory, segmentFileName);

  ffmpeg(videoLink)
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
    .outputOptions('-hls_segment_filename ' + segmentFilePath)
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
function generateAllSegments(videoLink, video) {
  let totalSegments = dimensions.length * resolutions.length;
  let completedSegments = 0;

  const checkCompletion = () => {
    if (completedSegments === totalSegments) {
      console.log('All segments generated successfully');
    }
  };

  for (const dimension of dimensions) {
    for (const resolution of resolutions) {
      generateSegments(videoLink, dimension, resolution, (err) => {
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

module.exports = {
  outputDirectory,
  generateSegments,
  generateAllSegments
}