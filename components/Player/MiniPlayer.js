import React from 'react';
import AudioControls from './AudioControls';
import FullscreenPlayer from './FullscreenPlayer';
import { useMusicContext } from '../../context/MusicContext';

const MiniPlayer = () => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { currentTrack } = useMusicContext();

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (!currentTrack) return null;

  return (
    <>
      <div className='mini-player' onClick={toggleFullscreen}>
        <div className='mini-player__info'>
          <p className='track-title'>{currentTrack.title}</p>
          <p className='artist-name'>{currentTrack.artist}</p>
        </div>
        <AudioControls size='small' />
      </div>
      {isFullscreen && (
        <FullscreenPlayer onClose={() => setIsFullscreen(false)} />
      )}
    </>
  );
};

export default MiniPlayer;