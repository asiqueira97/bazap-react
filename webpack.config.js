const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path');

module.exports = {
  entry: {
    popup: './src/Popup/app.jsx',
    content: './src/Content/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js','.jsx'],
  },
  module: {
    rules: [
      { 
        test: /\.(js|jsx)$/, 
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
    },
    {
      test: /\.(jpe?g|png|svg|gif)$/i,
      exclude: '/node_modules/',
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
     },
    },
    {
      test: /\.(sa|sc|c)ss$/,
      exclude: '/node_modules/',
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader'
      ]
    },
    {
      test: /\.(css)$/,
      use: ['css-loader','style-loader'],
    },
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
  ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "public" }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/assets/logo.png',
          to: path.join(__dirname, 'dist'),
          force: true
        },
      ],
    })
  ],
};