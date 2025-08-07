/**
 * Audio utility functions for the glassmorphism music player
 * Handles audio file validation, metadata extraction, and audio processing
 */

// Supported audio formats
export const SUPPORTED_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/m4a',
  'audio/flac'
];

// Maximum file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validates if the uploaded file is a supported audio format
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with success status and message
 */
export const validateAudioFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      message: 'No file selected'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      message: 'File size exceeds 50MB limit'
    };
  }

  // Check file type
  const isValidFormat = SUPPORTED_FORMATS.some(format => 
    file.type === format || 
    file.name.toLowerCase().endsWith(format.split('/')[1])
  );

  if (!isValidFormat) {
    return {
      isValid: false,
      message: 'Unsupported audio format. Please upload MP3, WAV, OGG, AAC, M4A, or FLAC files.'
    };
  }

  return {
    isValid: true,
    message: 'Valid audio file'
  };
};

/**
 * Creates a URL for the audio file that can be used with HTML5 audio
 * @param {File} file - The audio file
 * @returns {string} - Object URL for the file
 */
export const createAudioURL = (file) => {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Error creating audio URL:', error);
    return null;
  }
};

/**
 * Revokes the object URL to free up memory
 * @param {string} url - The object URL to revoke
 */
export const revokeAudioURL = (url) => {
  try {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error revoking audio URL:', error);
  }
};

/**
 * Extracts metadata from an audio file
 * @param {File} file - The audio file
 * @returns {Promise<Object>} - Promise resolving to metadata object
 */
export const extractAudioMetadata = (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = createAudioURL(file);
    
    if (!url) {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        duration: 0,
        size: file.size,
        format: file.type || 'unknown'
      });
      return;
    }

    audio.addEventListener('loadedmetadata', () => {
      const metadata = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        duration: audio.duration || 0,
        size: file.size,
        format: file.type || 'unknown'
      };
      
      revokeAudioURL(url);
      resolve(metadata);
    });

    audio.addEventListener('error', () => {
      const metadata = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        duration: 0,
        size: file.size,
        format: file.type || 'unknown'
      };
      
      revokeAudioURL(url);
      resolve(metadata);
    });

    audio.src = url;
  });
};

/**
 * Formats duration from seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Generates a unique ID for audio tracks
 * @returns {string} - Unique identifier
 */
export const generateTrackId = () => {
  return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates an audio track object with all necessary properties
 * @param {File} file - The audio file
 * @param {Object} metadata - Extracted metadata
 * @returns {Object} - Complete track object
 */
export const createTrackObject = async (file, metadata = null) => {
  try {
    const trackMetadata = metadata || await extractAudioMetadata(file);
    const url = createAudioURL(file);
    
    return {
      id: generateTrackId(),
      file,
      url,
      title: trackMetadata.title,
      artist: trackMetadata.artist,
      duration: trackMetadata.duration,
      size: trackMetadata.size,
      format: trackMetadata.format,
      addedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating track object:', error);
    throw new Error('Failed to create track object');
  }
};

/**
 * Cleans up resources for a track object
 * @param {Object} track - The track object to clean up
 */
export const cleanupTrack = (track) => {
  if (track && track.url) {
    revokeAudioURL(track.url);
  }
};

/**
 * Cleans up resources for multiple tracks
 * @param {Array} tracks - Array of track objects to clean up
 */
export const cleanupTracks = (tracks) => {
  if (Array.isArray(tracks)) {
    tracks.forEach(cleanupTrack);
  }
};

/**
 * Gets the current playback position as a percentage
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total duration in seconds
 * @returns {number} - Percentage (0-100)
 */
export const getPlaybackProgress = (currentTime, duration) => {
  if (!duration || duration === 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
};

/**
 * Calculates time from progress percentage
 * @param {number} percentage - Progress percentage (0-100)
 * @param {number} duration - Total duration in seconds
 * @returns {number} - Time in seconds
 */
export const getTimeFromProgress = (percentage, duration) => {
  if (!duration || duration === 0) return 0;
  return Math.min(duration, Math.max(0, (percentage / 100) * duration));
};

/**
 * Handles audio loading with proper error handling
 * @param {HTMLAudioElement} audioElement - The audio element
 * @param {string} src - Audio source URL
 * @returns {Promise<void>} - Promise that resolves when audio is loaded
 */
export const loadAudio = (audioElement, src) => {
  return new Promise((resolve, reject) => {
    if (!audioElement || !src) {
      reject(new Error('Invalid audio element or source'));
      return;
    }

    const handleLoad = () => {
      audioElement.removeEventListener('canplaythrough', handleLoad);
      audioElement.removeEventListener('error', handleError);
      resolve();
    };

    const handleError = (error) => {
      audioElement.removeEventListener('canplaythrough', handleLoad);
      audioElement.removeEventListener('error', handleError);
      reject(new Error('Failed to load audio'));
    };

    audioElement.addEventListener('canplaythrough', handleLoad);
    audioElement.addEventListener('error', handleError);
    
    audioElement.src = src;
    audioElement.load();
  });
};

/**
 * Safely plays audio with error handling
 * @param {HTMLAudioElement} audioElement - The audio element
 * @returns {Promise<void>} - Promise that resolves when playback starts
 */
export const playAudio = async (audioElement) => {
  try {
    if (!audioElement) {
      throw new Error('No audio element provided');
    }
    
    await audioElement.play();
  } catch (error) {
    console.error('Error playing audio:', error);
    throw new Error('Failed to play audio. Please check if the file is valid.');
  }
};

/**
 * Safely pauses audio
 * @param {HTMLAudioElement} audioElement - The audio element
 */
export const pauseAudio = (audioElement) => {
  try {
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
    }
  } catch (error) {
    console.error('Error pausing audio:', error);
  }
};