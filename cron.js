
const cron = require('cron');

//cron job to trigger the video processing
const job = new cron.CronJob('10 */1 * * *', () => {
  console.log('Video processing cron job started');
  // Trigger the video processing
  // You can replace this with your own logic for fetching and processing videos
  // For simplicity, I'm manually triggering the processing endpoint
  const http = require('http');
  http.get('http://localhost:3000/process');
});

job.start();
