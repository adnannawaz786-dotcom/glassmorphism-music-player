import styles from '../../styles/albumArt.css';

// ... existing imports

export default function MiniPlayer({ track, ...props }) {
  return (
    <div className="mini-player">
      <div className="album-art-container">
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