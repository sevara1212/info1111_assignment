/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ["article-assets.soho.com.au"],
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
  