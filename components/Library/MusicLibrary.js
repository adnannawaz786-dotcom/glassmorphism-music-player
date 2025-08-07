import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaTrash, FaMusic, FaClock, FaFileAudio } from 'react-icons/fa';

const MusicLibrary = ({ 
  tracks = [], 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  onTrackDelete,
  onPlayPause 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filteredTracks, setFilteredTracks] = useState([]);

  useEffect(() => {
    let filtered = tracks.filter(track =>
      track.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort tracks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'dateAdded':
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        default:
          return 0;
      }
    });

    setFilteredTracks(filtered);
  }, [tracks, searchTerm, sortBy]);

  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (size) => {
    if (!size) return '--';
    const mb = size / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleTrackClick = (track) => {
    if (currentTrack?.id === track.id) {
      onPlayPause();
    } else {
      onTrackSelect(track);
    }
  };

  const handleDeleteClick = (e, track) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${track.name}" from your library?`)) {
      onTrackDelete(track.id);
    }
  };

  return (
    <div className="music-library">
      {/* Header */}
      <div className="library-header">
        <div className="header-content">
          <div className="title-section">
            <FaMusic className="library-icon" />
            <h2>Music Library</h2>
            <span className="track-count">({tracks.length} tracks)</span>
          </div>
          
          {/* Search and Sort Controls */}
          <div className="controls-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="sort-container">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="duration">Sort by Duration</option>
                <option value="dateAdded">Sort by Date Added</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="track-list">
        {filteredTracks.length === 0 ? (
          <div className="empty-state">
            {tracks.length === 0 ? (
              <>
                <FaFileAudio className="empty-icon" />
                <h3>No music in your library</h3>
                <p>Upload some MP3 files to get started</p>
              </>
            ) : (
              <>
                <FaMusic className="empty-icon" />
                <h3>No tracks found</h3>
                <p>Try adjusting your search terms</p>
              </>
            )}
          </div>
        ) : (
          <div className="tracks-container">
            {filteredTracks.map((track, index) => (
              <div
                key={track.id}
                className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                onClick={() => handleTrackClick(track)}
              >
                <div className="track-number">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="playing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <span className="track-index">{index + 1}</span>
                  )}
                </div>

                <div className="track-info">
                  <div className="track-primary">
                    <h4 className="track-name">{track.name}</h4>
                    <div className="track-meta">
                      <span className="track-duration">
                        <FaClock className="meta-icon" />
                        {formatDuration(track.duration)}
                      </span>
                      <span className="track-size">
                        {formatFileSize(track.size)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="track-actions">
                  <button
                    className="play-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackClick(track);
                    }}
                    aria-label={currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>
                  
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteClick(e, track)}
                    aria-label="Remove track"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .music-library {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .library-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .library-icon {
          font-size: 1.5rem;
          color: #667eea;
        }

        .title-section h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
        }

        .track-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .controls-section {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-container {
          flex: 1;
          min-width: 200px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
        }

        .sort-select {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sort-select:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
        }

        .sort-select option {
          background: #1a1a2e;
          color: white;
        }

        .track-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.3);
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: white;
          font-weight: 500;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        .tracks-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .track-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          gap: 1rem;
        }

        .track-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .track-item.active {
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
        }

        .track-number {
          width: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .track-index {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .playing-indicator {
          display: flex;
          gap: 2px;
          align-items: flex-end;
          height: 1rem;
        }

        .playing-indicator span {
          width: 2px;
          background: #667eea;
          border-radius: 1px;
          animation: playing 1s ease-in-out infinite;
        }

        .playing-indicator span:nth-child(1) {
          height: 4px;
          animation-delay: 0s;
        }

        .playing-indicator span:nth-child(2) {
          height: 8px;
          animation-delay: 0.2s;
        }

        .playing-indicator span:nth-child(3) {
          height: 6px;
          animation-delay: 0.4s;
        }

        @keyframes playing {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2); }
        }

        .track-info {
          flex: 1;
          min-width: 0;
        }

        .track-primary {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .track-name {
          margin: 0;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .track-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .track-duration {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .meta-icon {
          font-size: 0.7rem;
        }

        .track-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .play-button,
        .delete-button {
          width: 2.5rem;
          height: 2.5rem;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .play-button {
          background: rgba(102, 126, 234, 0.8);
          color: white;
        }

        .play-button:hover {
          background: rgba(102, 126, 234, 1);
          transform: scale(1.05);
        }

        .delete-button {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
        }

        .delete-button:hover {
          background: rgba(239, 68, 68, 0.8);
          color: white;
          transform: scale(1.05);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .library-header {
            padding: 1rem;
          }

          .header-content {
            gap: 0.75rem;
          }

          .title-section h2 {
            font-size: 1.25rem;
          }

          .controls-section {
            flex-direction: column;
            gap: 0.75rem;
          }

          .search-container {
            min-width: auto;
          }

          .track-item {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .track-name {
            font-size: 0.