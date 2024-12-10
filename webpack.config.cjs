const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js', // 入口文件
  output: {
    filename: 'main.js', // 打包後的文件名
    path: path.resolve(__dirname, 'dist'), // 輸出目錄
  },
  mode: 'development', // 模式：開發或生產
  resolve: {
    fallback: {
      buffer: require.resolve('buffer'), // 添加對 Buffer 的支持
      assert: require.resolve("assert/"),
      process: require.resolve("process/browser")
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'], // 將 Buffer 設置為全局變量
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
};
