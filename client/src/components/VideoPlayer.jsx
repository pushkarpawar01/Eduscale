import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ src, onEnded }) => {
  const placeholderRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // We need to create the video element manually to avoid React/VideoJS fighting over the same node
    if (!placeholderRef.current) return;

    // Clear placeholder
    placeholderRef.current.innerHTML = '';

    // Create video element
    const videoElement = document.createElement('video');
    videoElement.className = 'video-js vjs-big-play-centered w-full h-full';
    placeholderRef.current.appendChild(videoElement);

    const player = playerRef.current = videojs(videoElement, {
      autoplay: false,
      controls: true,
      responsive: true,
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      sources: [{ src: src, type: 'video/mp4' }]
    }, () => {
      console.log('VideoJS: Player initialized');
    });

    player.on('ended', () => {
      if (onEnded) onEnded();
    });

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [src, onEnded]);

  return (
    <div className="w-full h-full bg-black overflow-hidden rounded-[2rem]">
      <style>{`
        .video-js {
          background-color: #000;
          width: 100% !important;
          height: 100% !important;
        }
        .video-js .vjs-control-bar {
          display: flex !important;
          background-color: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(10px);
          height: 60px !important;
          align-items: center;
          padding: 0 10px;
        }
        .video-js .vjs-big-play-button {
          width: 90px !important;
          height: 90px !important;
          line-height: 90px !important;
          border-radius: 50% !important;
          background-color: #f97316 !important;
          border: none !important;
          top: 50% !important;
          left: 50% !important;
          margin-top: -45px !important;
          margin-left: -45px !important;
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.4);
        }
        .vjs-playback-rate .vjs-playback-rate-value {
          font-size: 1.4em !important;
          line-height: 2 !important;
          font-weight: bold;
        }
      `}</style>
      <div ref={placeholderRef} className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
