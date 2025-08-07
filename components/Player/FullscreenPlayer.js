import styles from '../../styles/albumArt.css';

// ... existing imports

export default function FullscreenPlayer({ track, ...props }) {
  return (
    <div className="fullscreen-player">
      <div className="album-art-container fullscreen">
        <img 
          src={track.albumArt} 
          alt={track.title}
          className="album-art-image"
        />
        <div className="album-art-gradient" />
      </div>
      {/* ... rest of existing component code */}
    </div>
  );
}