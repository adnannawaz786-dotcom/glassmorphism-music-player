/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Image optimization configuration
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Webpack configuration for audio file handling
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // Handle font files for glassmorphism design
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // Optimize for client-side audio processing
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Trailing slash configuration
  trailingSlash: false,

  // Build output configuration
  distDir: '.next',
  cleanDistDir: true,

  // Development configuration
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // TypeScript configuration (if needed later)
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increased for audio file uploads
    },
    responseLimit: '10mb',
  },
};

module.exports = nextConfig;