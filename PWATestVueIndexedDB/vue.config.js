const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: 'Mijn Notities',
    short_name: 'Notes',
    description: 'A Notes progressive web app',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#41b383',
    icons: [
      {
        src: '/img/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      // Add more icons for different resolutions as needed
    ],
  },
})
