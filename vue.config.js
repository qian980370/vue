module.exports = {
  publicPath: './',

  devServer: {
    proxy: {
      '/api': {
        target: 'http://ericbackend.azurewebsites.net/',
        changeOrigin: true,
        pathRewrite: {
          '/api': ''
        }
      }
    }
  }
}
