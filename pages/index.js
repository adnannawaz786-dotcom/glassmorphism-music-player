import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import FileUpload from '../components/Upload/FileUpload';
import MiniPlayer from '../components/Player/MiniPlayer';
import MusicLibrary from '../components/Library/MusicLibrary';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState('library');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Load saved playlist from localStorage on component mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('musicPlaylist');
    if (savedPlaylist) {
      try {
        const parsedPlaylist = JSON.parse(savedPlaylist);
        setPlaylist(parsedPlaylist);
        setUploadedFiles(parsedPlaylist);
      } catch (error) {
        console.error('Error loading saved playlist:', error);
      }
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem('musicPlaylist', JSON.stringify(playlist));
    }
  }, [playlist]);

  // Handle file upload
  const handleFileUpload = (files) => {
    const newTracks = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name.replace(/\.[^/.]+$/, ''),
      file: file,
      url: URL.createObjectURL(file),
      duration: 0,
      artist: 'Unknown Artist',
      album: 'Unknown Album'
    }));

    setUploadedFiles(prev => [...prev, ...newTracks]);
    setPlaylist(prev => [...prev, ...newTracks]);
  };

  // Handle track selection
  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle next track
  const handleNextTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  // Handle previous track
  const handlePreviousTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  // Handle track removal
  const handleRemoveTrack = (trackId) => {
    const updatedPlaylist = playlist.filter(track => track.id !== trackId);
    setPlaylist(updatedPlaylist);
    setUploadedFiles(updatedPlaylist);
    
    // If the removed track is currently playing, stop playback
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  // Handle navigation change
  const handleNavigationChange = (view) => {
    setCurrentView(view);
  };

  // Render current view content
  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
              <h2>Upload Music</h2>
              <p>Add MP3 files to your library</p>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
            {uploadedFiles.length > 0 && (
              <div className={styles.recentUploads}>
                <h3>Recently Added</h3>
                <div className={styles.recentList}>
                  {uploadedFiles.slice(-3).map((track) => (
                    <div key={track.id} className={styles.recentItem}>
                      <div className={styles.trackInfo}>
                        <span className={styles.trackName}>{track.name}</span>
                        <span className={styles.trackArtist}>{track.artist}</span>
                      </div>
                      <button
                        className={styles.playButton}
                        onClick={() => handleTrackSelect(track)}
                        aria-label={`Play ${track.name}`}
                      >
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'library':
        return (
          <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
              <h2>Music Library</h2>
              <p>{playlist.length} track{playlist.length !== 1 ? 's' : ''}</p>
            </div>
            <MusicLibrary
              tracks={playlist}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={handleTrackSelect}
              onRemoveTrack={handleRemoveTrack}
            />
          </div>
        );
      
      case 'player':
        return (
          <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
              <h2>Now Playing</h2>
            </div>
            <div className={styles.playerView}>
              {currentTrack ? (
                <div className={styles.fullPlayer}>
                  <div className={styles.albumArt}>
                    <div className={styles.albumPlaceholder}>
                      <span>♪</span>
                    </div>
                  </div>
                  <div className={styles.trackDetails}>
                    <h3>{currentTrack.name}</h3>
                    <p>{currentTrack.artist}</p>
                    <p className={styles.album}>{currentTrack.album}</p>
                  </div>
                </div>
              ) : (
                <div className={styles.noTrack}>
                  <div className={styles.noTrackIcon}>♪</div>
                  <h3>No track selected</h3>
                  <p>Choose a song from your library to start playing</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className={styles.viewContainer}>
            <div className={styles.welcome}>
              <h2>Welcome to Music Player</h2>
              <p>Upload your favorite MP3 files and enjoy your music collection</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Glassmorphism Music Player</title>
        <meta name="description" content="A beautiful glassmorphism music player with file upload and mini player" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout onNavigationChange={handleNavigationChange} currentView={currentView}>
        <main className={styles.main}>
          {renderCurrentView()}
        </main>

        {/* Mini Player - Always visible when a track is selected */}
        {currentTrack && (
          <MiniPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            hasNext={playlist.length > 1}
            hasPrevious={playlist.length > 1}
          />
        )}
      </Layout>
    </>
  );
}