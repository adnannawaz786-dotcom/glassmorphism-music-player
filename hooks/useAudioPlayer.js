import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      
      // Set up event listeners
      const audio = audioRef.current;
      
      const handleLoadStart = () => setIsLoading(true);
      const handleLoadedData = () => {
        setIsLoading(false);
        setDuration(audio.duration || 0);
        setError(null);
      };
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
      const handleEnded = () => {
        setIsPlaying(false);
        if (isLoop) {
          audio.currentTime = 0;
          audio.play();
          setIsPlaying(true);
        } else {
          handleNext();
        }
      };
      const handleError = (e) => {
        setIsLoading(false);
        setIsPlaying(false);
        setError('Failed to load audio file');
        console.error('Audio error:', e);
      };
      const handleCanPlay = () => setIsLoading(false);
      const handleWaiting = () => setIsLoading(true);
      const handlePlaying = () => setIsLoading(false);

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
        audio.pause();
        audio.src = '';
      };
    }
  }, [isLoop]);

  // Load track
  const loadTrack = useCallback((track, trackIndex = -1) => {
    if (!audioRef.current || !track) return;

    try {
      setError(null);
      setIsLoading(true);
      
      // Pause current track
      audioRef.current.pause();
      
      // Set new track
      audioRef.current.src = track.url || track.src || track;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.loop = isLoop;
      
      setCurrentTrack(track);
      setCurrentTrackIndex(trackIndex);
      setCurrentTime(0);
      setIsPlaying(false);
      
    } catch (err) {
      setError('Failed to load track');
      setIsLoading(false);
      console.error('Load track error:', err);
    }
  }, [volume, isMuted, playbackRate, isLoop]);

  // Play/Pause toggle
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Playback failed');
      setIsPlaying(false);
      console.error('Play/pause error:', err);
    }
  }, [isPlaying, currentTrack]);

  // Play specific track
  const play = useCallback(async (track, trackIndex = -1) => {
    if (track && track !== currentTrack) {
      loadTrack(track, trackIndex);
    }
    
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Playback failed');
      setIsPlaying(false);
      console.error('Play error:', err);
    }
  }, [currentTrack, loadTrack]);

  // Pause
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Seek to specific time
  const seek = useCallback((time) => {
    if (!audioRef.current || !duration) return;
    
    const seekTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, [duration]);

  // Seek by percentage (0-1)
  const seekToPercentage = useCallback((percentage) => {
    if (!duration) return;
    
    const time = duration * Math.max(0, Math.min(percentage, 1));
    seek(time);
  }, [duration, seek]);

  // Volume control
  const changeVolume = useCallback((newVolume) => {
    const vol = Math.max(0, Math.min(newVolume, 1));
    setVolume(vol);
    
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : vol;
    }
  }, [isMuted]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Playback rate control
  const changePlaybackRate = useCallback((rate) => {
    const newRate = Math.max(0.25, Math.min(rate, 4));
    setPlaybackRate(newRate);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  }, []);

  // Loop toggle
  const toggleLoop = useCallback(() => {
    const newLoop = !isLoop;
    setIsLoop(newLoop);
    
    if (audioRef.current) {
      audioRef.current.loop = newLoop;
    }
  }, [isLoop]);

  // Shuffle toggle
  const toggleShuffle = useCallback(() => {
    setIsShuffle(!isShuffle);
  }, [isShuffle]);

  // Next track
  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    
    if (isShuffle) {
      // Random next track
      const availableIndices = playlist.map((_, index) => index).filter(i => i !== currentTrackIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      // Sequential next track
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    if (nextIndex !== undefined && playlist[nextIndex]) {
      play(playlist[nextIndex], nextIndex);
    }
  }, [playlist, currentTrackIndex, isShuffle, play]);

  // Previous track
  const handlePrevious = useCallback(() => {
    if (playlist.length === 0) return;
    
    let prevIndex;
    
    if (isShuffle) {
      // Random previous track
      const availableIndices = playlist.map((_, index) => index).filter(i => i !== currentTrackIndex);
      prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      // Sequential previous track
      prevIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1;
    }
    
    if (prevIndex !== undefined && playlist[prevIndex]) {
      play(playlist[prevIndex], prevIndex);
    }
  }, [playlist, currentTrackIndex, isShuffle, play]);

  // Update playlist
  const updatePlaylist = useCallback((newPlaylist) => {
    setPlaylist(newPlaylist);
    
    // Update current track index if current track is in new playlist
    if (currentTrack) {
      const index = newPlaylist.findIndex(track => 
        track.id === currentTrack.id || 
        track.url === currentTrack.url ||
        track.src === currentTrack.src
      );
      setCurrentTrackIndex(index);
    }
  }, [currentTrack]);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    if (!duration || !currentTime) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  return {
    // State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    playbackRate,
    isLoop,
    isShuffle,
    playlist,
    currentTrackIndex,
    
    // Actions
    loadTrack,
    play,
    pause,
    stop,
    togglePlay,
    seek,
    seekToPercentage,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    toggleLoop,
    toggleShuffle,
    handleNext,
    handlePrevious,
    updatePlaylist,
    
    // Helpers
    formatTime,
    getProgress,
    
    // Audio ref for advanced usage
    audioRef
  };
};

export default useAudioPlayer;