import React from 'react';
import styles from './AudioControls.module.css';

const AudioControls = ({ 
  isPlaying, 
  onPlayPause, 
  onPrevious, 
  onNext, 
  currentTime, 
  duration, 
  onSeek, 
  volume, 
  onVolumeChange,
  isMuted,
  onMuteToggle,
  isShuffled,
  onShuffleToggle,
  isRepeated,
  onRepeatToggle,
  hasNext,
  hasPrevious 
}) => {
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    onSeek(seekTime);
  };

  const handleVolumeChange = (e) => {
    onVolumeChange(e.target.value / 100);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.audioControls}>
      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar}
            style={{ width: `${progressPercentage}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeekChange}
            className={styles.progressInput}
            aria-label="Seek audio position"
          />
        </div>
        <span className={styles.timeDisplay}>{formatTime(duration)}</span>
      </div>

      {/* Main Controls */}
      <div className={styles.mainControls}>
        <button
          onClick={onShuffleToggle}
          className={`${styles.controlButton} ${styles.secondaryButton} ${isShuffled ? styles.active : ''}`}
          aria-label="Toggle shuffle"
          title="Shuffle"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
        </button>

        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`${styles.controlButton} ${styles.navigationButton}`}
          aria-label="Previous track"
          title="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <button
          onClick={onPlayPause}
          className={`${styles.controlButton} ${styles.playButton}`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`${styles.controlButton} ${styles.navigationButton}`}
          aria-label="Next track"
          title="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <button
          onClick={onRepeatToggle}
          className={`${styles.controlButton} ${styles.secondaryButton} ${isRepeated ? styles.active : ''}`}
          aria-label="Toggle repeat"
          title="Repeat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
        </button>
      </div>

      {/* Volume Controls */}
      <div className={styles.volumeSection}>
        <button
          onClick={onMuteToggle}
          className={`${styles.controlButton} ${styles.volumeButton}`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : volume < 0.5 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>
        <div className={styles.volumeContainer}>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label="Volume control"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;