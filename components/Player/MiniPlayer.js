import React, { useState, useRef, useEffect } from 'react';
import AudioControls from './AudioControls';

const MiniPlayer = ({ currentTrack, isPlaying, onPlayPause, onNext, onPrevious, playlist = [] }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (onNext) onNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSeek = (e) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        preload="metadata"
      />
      
      <div className={`mini-player ${isExpanded ? 'expanded' : ''}`}>
        <div className="mini-player-content">
          {/* Compact View */}
          <div className="compact-view" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="track-info">
              <div className="album-art">
                {currentTrack.artwork ? (
                  <img src={currentTrack.artwork} alt={currentTrack.title} />
                ) : (
                  <div className="default-artwork">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="track-details">
                <div className="track-title">{currentTrack.title}</div>
                <div className="track-artist">{currentTrack.artist || 'Unknown Artist'}</div>
              </div>
            </div>

            <div className="compact-controls">
              <button
                className="control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlayPause) onPlayPause();
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <button
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                aria-label="Expand player"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div 
              className="progress-bar" 
              onClick={handleSeek}
              role="slider"
              aria-label="Seek"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' && audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, currentTime - 10);
                } else if (e.key === 'ArrowRight' && audioRef.current) {
                  audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                }
              }}
            >
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                />
                <div 
                  className="progress-thumb" 
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Expanded View */}
          {isExpanded && (
            <div className="expanded-view">
              <div className="expanded-header">
                <div className="time-display">
                  <span className="current-time">{formatTime(currentTime)}</span>
                  <span className="duration">{formatTime(duration)}</span>
                </div>
                <button
                  className="collapse-btn"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Collapse player"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" transform="rotate(180 12 12)"/>
                  </svg>
                </button>
              </div>

              <AudioControls
                isPlaying={isPlaying}
                onPlayPause={onPlayPause}
                onNext={onNext}
                onPrevious={onPrevious}
                hasNext={playlist.length > 1}
                hasPrevious={playlist.length > 1}
              />

              <div className="volume-control">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  aria-label="Volume"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mini-player {
          position: fixed;
          bottom: 80px;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 100;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 200px;
          overflow: hidden;
        }

        .mini-player.expanded {
          max-height: 300px;
        }

        .mini-player-content {
          padding: 0;
        }

        .compact-view {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .compact-view:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .track-info {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        .album-art {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          margin-right: 12px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .album-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .default-artwork {
          color: rgba(255, 255, 255, 0.6);
        }

        .track-details {
          min-width: 0;
          flex: 1;
        }

        .track-title {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .track-artist {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .compact-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-btn, .expand-btn, .collapse-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .control-btn:hover, .expand-btn:hover, .collapse-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .control-btn:active, .expand-btn:active, .collapse-btn:active {
          transform: scale(0.95);
        }

        .progress-container {
          padding: 0 16px 8px;
        }

        .progress-bar {
          cursor: pointer;
          padding: 8px 0;
        }

        .progress-track {
          position: relative;
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
          transition: width 0.1s ease;
        }

        .progress-thumb {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .progress-bar:hover .progress-thumb {
          opacity: 1;
        }

        .expanded-view {
          padding: 0 16px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .expanded-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 8px;
        }

        .time-display {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }

        .volume-control svg {
          color: rgba(255, 255, 255, 0.7);
          flex-shrink: 0;
        }

        .volume-slider {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {