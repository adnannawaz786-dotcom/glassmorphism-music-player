import React from 'react';
import AudioControls from './AudioControls';
import { useMusicContext } from '../../context/MusicContext';

const FullscreenPlayer = ({ onClose }) => {
  const { currentTrack, isPlaying, currentTime, duration } = useMusicContext();

  return (
    <div className='fullscreen-player'>
      <div className='fullscreen-player__header'>
        <button onClick={onClose} className='close-btn'>
          <img src='/icons/music-icons.svg#close' alt='Close' />
        </button>
      </div>
      <div className='fullscreen-player__artwork'>
        {currentTrack?.artwork || (
          <div className='default-artwork'></div>
        )}
      </div>
      <div className='fullscreen-player__info'>
        <h2>{currentTrack?.title || 'No Track Selected'}</h2>
        <p>{currentTrack?.artist || 'Unknown Artist'}</p>
      </div>
      <div className='fullscreen-player__timeline'>
        <div className='progress-bar'>
          <div 
            className='progress'
            style={{width: `${(currentTime / duration) * 100}%`}}
          ></div>
        </div>
        <div className='time-info'>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <AudioControls size='large' />
    </div>
  );
};

export default FullscreenPlayer;