import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const MusicContext = createContext();

// Action types
const MUSIC_ACTIONS = {
  SET_PLAYLIST: 'SET_PLAYLIST',
  ADD_TRACK: 'ADD_TRACK',
  REMOVE_TRACK: 'REMOVE_TRACK',
  SET_CURRENT_TRACK: 'SET_CURRENT_TRACK',
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  TOGGLE_PLAY_PAUSE: 'TOGGLE_PLAY_PAUSE',
  SET_DURATION: 'SET_DURATION',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_VOLUME: 'SET_VOLUME',
  SET_MUTED: 'SET_MUTED',
  SET_SHUFFLE: 'SET_SHUFFLE',
  SET_REPEAT: 'SET_REPEAT',
  NEXT_TRACK: 'NEXT_TRACK',
  PREVIOUS_TRACK: 'PREVIOUS_TRACK',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  playlist: [],
  currentTrack: null,
  currentTrackIndex: -1,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 1,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'none', // 'none', 'one', 'all'
  isLoading: false,
  error: null
};

// Reducer function
function musicReducer(state, action) {
  switch (action.type) {
    case MUSIC_ACTIONS.SET_PLAYLIST:
      return {
        ...state,
        playlist: action.payload,
        currentTrackIndex: action.payload.length > 0 ? 0 : -1,
        currentTrack: action.payload.length > 0 ? action.payload[0] : null
      };

    case MUSIC_ACTIONS.ADD_TRACK:
      const newPlaylist = [...state.playlist, action.payload];
      return {
        ...state,
        playlist: newPlaylist,
        currentTrack: state.currentTrack || action.payload,
        currentTrackIndex: state.currentTrackIndex === -1 ? 0 : state.currentTrackIndex
      };

    case MUSIC_ACTIONS.REMOVE_TRACK:
      const filteredPlaylist = state.playlist.filter((_, index) => index !== action.payload);
      let newCurrentIndex = state.currentTrackIndex;
      let newCurrentTrack = state.currentTrack;

      if (action.payload === state.currentTrackIndex) {
        // Removing current track
        if (filteredPlaylist.length === 0) {
          newCurrentIndex = -1;
          newCurrentTrack = null;
        } else if (action.payload >= filteredPlaylist.length) {
          newCurrentIndex = 0;
          newCurrentTrack = filteredPlaylist[0];
        } else {
          newCurrentTrack = filteredPlaylist[action.payload];
        }
      } else if (action.payload < state.currentTrackIndex) {
        newCurrentIndex = state.currentTrackIndex - 1;
      }

      return {
        ...state,
        playlist: filteredPlaylist,
        currentTrack: newCurrentTrack,
        currentTrackIndex: newCurrentIndex,
        isPlaying: filteredPlaylist.length === 0 ? false : state.isPlaying
      };

    case MUSIC_ACTIONS.SET_CURRENT_TRACK:
      const trackIndex = state.playlist.findIndex(track => track.id === action.payload.id);
      return {
        ...state,
        currentTrack: action.payload,
        currentTrackIndex: trackIndex,
        currentTime: 0
      };

    case MUSIC_ACTIONS.PLAY:
      return {
        ...state,
        isPlaying: true,
        error: null
      };

    case MUSIC_ACTIONS.PAUSE:
      return {
        ...state,
        isPlaying: false
      };

    case MUSIC_ACTIONS.TOGGLE_PLAY_PAUSE:
      return {
        ...state,
        isPlaying: !state.isPlaying
      };

    case MUSIC_ACTIONS.SET_DURATION:
      return {
        ...state,
        duration: action.payload
      };

    case MUSIC_ACTIONS.SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload
      };

    case MUSIC_ACTIONS.SET_VOLUME:
      return {
        ...state,
        volume: Math.max(0, Math.min(1, action.payload)),
        isMuted: action.payload === 0
      };

    case MUSIC_ACTIONS.SET_MUTED:
      return {
        ...state,
        isMuted: action.payload
      };

    case MUSIC_ACTIONS.SET_SHUFFLE:
      return {
        ...state,
        isShuffled: action.payload
      };

    case MUSIC_ACTIONS.SET_REPEAT:
      return {
        ...state,
        repeatMode: action.payload
      };

    case MUSIC_ACTIONS.NEXT_TRACK:
      if (state.playlist.length === 0) return state;

      let nextIndex;
      if (state.isShuffled) {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
      }

      return {
        ...state,
        currentTrack: state.playlist[nextIndex],
        currentTrackIndex: nextIndex,
        currentTime: 0
      };

    case MUSIC_ACTIONS.PREVIOUS_TRACK:
      if (state.playlist.length === 0) return state;

      let prevIndex;
      if (state.currentTime > 3) {
        // If more than 3 seconds played, restart current track
        return {
          ...state,
          currentTime: 0
        };
      } else {
        prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) {
          prevIndex = state.playlist.length - 1;
        }
      }

      return {
        ...state,
        currentTrack: state.playlist[prevIndex],
        currentTrackIndex: prevIndex,
        currentTime: 0
      };

    case MUSIC_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case MUSIC_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case MUSIC_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Context Provider Component
export function MusicProvider({ children }) {
  const [state, dispatch] = useReducer(musicReducer, initialState);
  const audioRef = useRef(null);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      dispatch({ type: MUSIC_ACTIONS.SET_DURATION, payload: audio.duration });
      dispatch({ type: MUSIC_ACTIONS.SET_LOADING, payload: false });
    };

    const handleTimeUpdate = () => {
      dispatch({ type: MUSIC_ACTIONS.SET_CURRENT_TIME, payload: audio.currentTime });
    };

    const handleEnded = () => {
      if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (state.repeatMode === 'all' || state.currentTrackIndex < state.playlist.length - 1) {
        dispatch({ type: MUSIC_ACTIONS.NEXT_TRACK });
      } else {
        dispatch({ type: MUSIC_ACTIONS.PAUSE });
      }
    };

    const handleError = (e) => {
      dispatch({ 
        type: MUSIC_ACTIONS.SET_ERROR, 
        payload: 'Failed to load audio file' 
      });
    };

    const handleLoadStart = () => {
      dispatch({ type: MUSIC_ACTIONS.SET_LOADING, payload: true });
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [state.repeatMode, state.currentTrackIndex, state.playlist.length]);

  // Update audio source when current track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && state.currentTrack) {
      audio.src = state.currentTrack.url;
      audio.load();
    }
  }, [state.currentTrack]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    if (state.isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          dispatch({ 
            type: MUSIC_ACTIONS.SET_ERROR, 
            payload: 'Failed to play audio' 
          });
          dispatch({ type: MUSIC_ACTIONS.PAUSE });
        });
      }
    } else {
      audio.pause();
    }
  }, [state.isPlaying, state.currentTrack]);

  // Handle volume and mute changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  // Action creators
  const actions = {
    setPlaylist: (playlist) => {
      dispatch({ type: MUSIC_ACTIONS.SET_PLAYLIST, payload: playlist });
    },

    addTrack: (track) => {
      dispatch({ type: MUSIC_ACTIONS.ADD_TRACK, payload: track });
    },

    removeTrack: (index) => {
      dispatch({ type: MUSIC_ACTIONS.REMOVE_TRACK, payload: index });
    },

    setCurrentTrack: (track) => {
      dispatch({ type: MUSIC_ACTIONS.SET_CURRENT_TRACK, payload: track });
    },

    play: () => {
      if (state.currentTrack) {
        dispatch({ type: MUSIC_ACTIONS.PLAY });
      }
    },

    pause: () => {
      dispatch({ type: MUSIC_ACTIONS.PAUSE });
    },

    togglePlayPause: () => {
      if (state.currentTrack) {
        dispatch({ type: MUSIC_ACTIONS.TOGGLE_PLAY_PAUSE });
      }
    },

    seekTo: (time) => {
      const audio = audioRef.current;
      if (audio && state.currentTrack) {
        audio.currentTime = Math.max(0, Math.min(time, state.duration));
      }
    },

    setVolume: (volume) => {
      dispatch({ type: MUSIC_ACTIONS.SET_VOLUME, payload: volume });
    },

    toggleMute: () => {
      dispatch({ type: MUSIC_ACTIONS.SET_MUTED, payload: !state.isMuted });
    },

    toggleShuffle: () => {
      dispatch({ type: MUSIC_ACTIONS.SET_SHUFFLE, payload: !state.isShuffled });
    },

    setRepeatMode: (mode) => {
      const modes = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = mode || modes[(currentIndex + 1) % modes.length];
      dispatch({ type: MUSIC_ACTIONS.SET_REPEAT, payload: nextMode });
    },

    nextTrack: () => {
      dispatch({ type: MUSIC_ACTIONS.NEXT_TRACK });
    },

    previousTrack: () => {
      dispatch({ type: MUSIC_ACTIONS.PREVIOUS_TRACK });
    },

    clearError: () => {
      dispatch({ type: MUSIC_ACTIONS.CLEAR_ERROR });
    }
  };

  const value = {
    ...state,
    actions,
    audioRef
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicContext.Provider>
  );
}

// Custom hook to use the music context
export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}

export default MusicContext;