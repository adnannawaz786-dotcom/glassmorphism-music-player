import React, { useState, useRef, useCallback } from 'react';
import styles from './FileUpload.module.css';

const FileUpload = ({ onFilesUploaded, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid audio file (MP3, WAV, OGG)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    return null;
  };

  const processFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    // Validate all files
    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`File ${index + 1}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (validFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const processedFiles = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const progress = ((i + 1) / validFiles.length) * 100;
        setUploadProgress(progress);

        // Create audio metadata
        const audioUrl = URL.createObjectURL(file);
        const audio = new Audio(audioUrl);
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            const fileData = {
              id: Date.now() + Math.random(),
              name: file.name.replace(/\.[^/.]+$/, ''),
              file: file,
              url: audioUrl,
              duration: audio.duration,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            };
            processedFiles.push(fileData);
            resolve();
          });
          
          audio.addEventListener('error', () => {
            reject(new Error(`Failed to load audio file: ${file.name}`));
          });
        });
      }

      // Notify parent component
      if (onFilesUploaded) {
        onFilesUploaded(processedFiles);
      }

      // Reset form
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
    } catch (err) {
      setError(err.message || 'Failed to process files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFilesUploaded]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={`${styles.uploadContainer} ${className}`}>
      <div
        className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''} ${uploading ? styles.uploading : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg"
          onChange={handleChange}
          className={styles.fileInput}
          disabled={uploading}
        />

        <div className={styles.uploadContent}>
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              <h3>Processing Files...</h3>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>{Math.round(uploadProgress)}% complete</p>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <div className={styles.uploadIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.828 14.828L12 12M12 12L9.172 14.828M12 12V21M20 16.5C20 17.8807 18.8807 19 17.5 19H6.5C5.11929 19 4 17.8807 4 16.5C4 15.1193 5.11929 14 6.5 14C6.5 11.7909 8.29086 10 10.5 10C12.7091 10 14.5 11.7909 14.5 14C16.9853 14 19 16.0147 19 18.5C19 19.8807 17.8807 21 16.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Upload Music Files</h3>
              <p>Drag and drop your MP3, WAV, or OGG files here</p>
              <button 
                type="button" 
                onClick={onButtonClick}
                className={styles.uploadButton}
              >
                Browse Files
              </button>
              <div className={styles.uploadInfo}>
                <p>Supports: MP3, WAV, OGG • Max size: 50MB per file</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;