import React from 'react';
import Head from 'next/head';
import BottomNavigation from '../Navigation/BottomNavigation';
import MiniPlayer from '../Player/MiniPlayer';
import { usePlayer } from '../../contexts/PlayerContext';

const Layout = ({ children, title = 'Glassmorphism Music Player', description = 'A beautiful music player with glassmorphism design' }) => {
  const { currentTrack } = usePlayer();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="layout">
        {/* Animated background */}
        <div className="background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="noise-overlay"></div>
        </div>

        {/* Main content area */}
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>

        {/* Mini player - shows when track is playing */}
        {currentTrack && (
          <div className="mini-player-container">
            <MiniPlayer />
          </div>
        )}

        {/* Bottom navigation */}
        <BottomNavigation />
      </div>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -2;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.7;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #48cae4, #023e8a);
          top: 50%;
          right: -150px;
          animation-delay: -10s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: linear-gradient(45deg, #a8edea, #fed6e3);
          bottom: -125px;
          left: 20%;
          animation-delay: -5s;
        }

        .noise-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: -1;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          33% {
            transform: translate(30px, -50px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          padding-bottom: calc(80px + env(safe-area-inset-bottom));
        }

        .content-wrapper {
          flex: 1;
          padding: 20px;
          padding-top: max(20px, env(safe-area-inset-top));
          padding-left: max(20px, env(safe-area-inset-left));
          padding-right: max(20px, env(safe-area-inset-right));
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .mini-player-container {
          position: fixed;
          bottom: calc(80px + env(safe-area-inset-bottom));
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 20px;
          padding-left: max(20px, env(safe-area-inset-left));
          padding-right: max(20px, env(safe-area-inset-right));
          transform: translateY(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mini-player-container.hidden {
          transform: translateY(100%);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 16px;
            padding-top: max(16px, env(safe-area-inset-top));
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }

          .mini-player-container {
            padding: 0 16px;
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }

          .orb-1 {
            width: 300px;
            height: 300px;
          }

          .orb-2 {
            width: 200px;
            height: 200px;
          }

          .orb-3 {
            width: 180px;
            height: 180px;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding-bottom: calc(70px + env(safe-area-inset-bottom));
          }

          .mini-player-container {
            bottom: calc(70px + env(safe-area-inset-bottom));
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .background {
            background: linear-gradient(135deg, #000080 0%, #000040 100%);
          }

          .noise-overlay {
            opacity: 0;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .gradient-orb {
            animation: none;
          }

          .mini-player-container {
            transition: none;
          }
        }

        /* Print styles */
        @media print {
          .background,
          .mini-player-container,
          .bottom-navigation {
            display: none;
          }

          .main-content {
            padding-bottom: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;