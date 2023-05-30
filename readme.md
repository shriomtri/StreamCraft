# Video Streaming Server

## Introduction
This project provides a video streaming server built with Node.js that supports adaptive streaming and serves videos in different resolutions and dimensions based on the user's bandwidth. It uses HLS (HTTP Live Streaming) protocol for video delivery.

## Prerequisites
Before using this project, ensure that you have the following installed:

- Node.js (version 12 or higher)
- FFmpeg (installed and added to the system PATH)

## Installation
1. Clone the repository:
```
git clone https://github.com/your-username/video-streaming-server.git
```

2. Install the dependencies:
```
cd video-streaming-server
npm install
```

3. Configure the server:
- Open the `config.js` file and adjust the server settings according to your requirements.
- Specify the path to FFmpeg executable in the `ffmpegPath` variable.

4. Start the server:
```
npm start
```

## Usage
1. Prepare your video file in MP4 format and place it in the `videos` directory.

2. Access the streaming server through the following URL:
```
http://localhost:3000/
```

3. Select the desired video resolution and dimension from the dropdown menu.

4. Click the "Play" button to start the video playback. The server will dynamically adjust the video quality based on your bandwidth.

## Example
To illustrate the usage, let's assume you have a video file named `video.mp4` in the `videos` directory. You can access the streaming server and play the video in different resolutions and dimensions by following these steps:

1. Start the server by running `npm start`.

2. Open your web browser and visit `http://localhost:3000/player`.

3. Select the desired resolution and dimension from the dropdown menu.

4. Click the "Play" button to start the video playback.

## Summary
The Video Streaming Server project allows you to serve videos with adaptive streaming capabilities, delivering the appropriate video quality based on the user's bandwidth. By following the installation steps and using the provided server, you can easily stream videos in different resolutions and dimensions. Enjoy seamless video playback and provide an optimal streaming experience to your users.

If you encounter any issues or have questions, please feel free to open an issue in the repository or reach out to the project maintainers.


