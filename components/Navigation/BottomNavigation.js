import React, { useState } from 'react';
import styles from './BottomNavigation.module.css';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navigationItems = [
    {
      id: 'library',
      label: 'Library',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
          <path d="M12 11L16 15H13V19H11V15H8L12 11Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'player',
      label: 'Player',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'playlist',
      label: 'Playlist',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" fill="currentColor"/>
        </svg>
      )
    }
  ];

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleKeyDown = (event, tabId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(tabId);
    }
  };

  return (
    <nav className={styles.bottomNavigation} role="navigation" aria-label="Main navigation">
      <div className={styles.navContainer}>
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => handleTabClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            aria-label={item.label}
            aria-current={activeTab === item.id ? 'page' : undefined}
            type="button"
          >
            <div className={styles.iconWrapper}>
              {item.icon}
            </div>
            <span className={styles.label}>{item.label}</span>
            {activeTab === item.id && <div className={styles.activeIndicator} />}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;