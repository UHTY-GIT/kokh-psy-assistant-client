const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // Дозволяє доступ з будь-якої адреси
    allowedHosts: 'all', // Це дозволить доступ з будь-якого хоста
    historyApiFallback: true, // Додаємо це для правильного оброблення маршрутизації на стороні клієнта
  }
})
