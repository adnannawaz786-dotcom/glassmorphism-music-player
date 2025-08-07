import { useState, useEffect } from 'react';
import '../styles/globals.css';

// Audio Context for global music player state
export const AudioContext = React.createContext();

function MyApp({ Component, pageProps }) {
  // Global audio player state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.volume = volume;
      setAudioRef(audio);

      // Audio event listeners
      const handleLoadedData = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        // Auto play next track
        if (currentTrackIndex < playlist.length - 1) {
          playNext();
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };

      const handleError = (e) => {
        setError('Failed to load audio file');
        setIsLoading(false);
        setIsPlaying(false);
      };

      const handleLoadStart = () => {
        setIsLoading(true);
        setError(null);
      };

      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadstart', handleLoadStart);

      return () => {
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.pause();
      };
    }
  }, []);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef) {
      audioRef.volume = volume;
    }
  }, [volume, audioRef]);

  // Play/pause functionality
  const togglePlayPause = async () => {
    if (!audioRef || !currentTrack) return;

    try {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        await audioRef.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  // Play specific track
  const playTrack = (track, index = 0) => {
    if (!audioRef) return;

    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setError(null);
    
    audioRef.src = track.url;
    audioRef.load();
    
    // Auto play after loading
    audioRef.addEventListener('canplay', () => {
      audioRef.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        setError('Failed to play audio');
        setIsPlaying(false);
      });
    }, { once: true });
  };

  // Play next track
  const playNext = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    
    if (nextTrack) {
      playTrack(nextTrack, nextIndex);
    }
  };

  // Play previous track
  const playPrevious = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    const prevTrack = playlist[prevIndex];
    
    if (prevTrack) {
      playTrack(prevTrack, prevIndex);
    }
  };

  // Seek to specific time
  const seekTo = (time) => {
    if (audioRef) {
      audioRef.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Add track to playlist
  const addToPlaylist = (track) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev, track];
      return newPlaylist;
    });
  };

  // Remove track from playlist
  const removeFromPlaylist = (index) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter((_, i) => i !== index);
      
      // Adjust current track index if needed
      if (index === currentTrackIndex && newPlaylist.length > 0) {
        const nextTrack = newPlaylist[Math.min(index, newPlaylist.length - 1)];
        playTrack(nextTrack, Math.min(index, newPlaylist.length - 1));
      } else if (index < currentTrackIndex) {
        setCurrentTrackIndex(prev => prev - 1);
      } else if (index === currentTrackIndex) {
        setCurrentTrack(null);
        setIsPlaying(false);
        if (audioRef) {
          audioRef.pause();
        }
      }
      
      return newPlaylist;
    });
  };

  // Clear playlist
  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentTrack(null);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    if (audioRef) {
      audioRef.pause();
      audioRef.src = '';
    }
  };

  // Format time helper
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Audio context value
  const audioContextValue = {
    // State
    currentTrack,
    isPlaying,
    playlist,
    currentTrackIndex,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    
    // Actions
    togglePlayPause,
    playTrack,
    playNext,
    playPrevious,
    seekTo,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    setVolume,
    setError,
    
    // Helpers
    formatTime
  };

  return (
    <AudioContext.Provider value={audioContextValue}>
      <div id="app-root">
        <Component {...pageProps} />
      </div>
    </AudioContext.Provider>
  );
}

export default MyApp;