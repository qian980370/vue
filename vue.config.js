module.exports = {
  publicPath: '/',

  devServer: {
    proxy: {
      '/api': {
        // target: 'http://ericbackend.azurewebsites.net/',
        target:'http://localhost:9090',
        changeOrigin: true,
        pathRewrite: {
          '/api': ''
        }
      }
    }
  }
}
