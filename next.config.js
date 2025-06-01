/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'article-assets.soho.com.au',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'i.pinimg.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.(pdf|doc|docx)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next/static/files',
              outputPath: 'static/files',
              name: '[name].[ext]',
            },
          },
        ],
      });
      return config;
    },
  };
  
  module.exports = nextConfig;
  