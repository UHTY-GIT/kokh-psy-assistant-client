const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // Дозволяє доступ з будь-якої адреси
    //public: 'assistant.psy-kokh.online:8080', // Замініть 'your-remote-address:port' на вашу IP-адресу та порт, наприклад, '192.168.1.5:8080'.
    // Вимикає перевірку хоста, потрібно для доступу через будь-яку адресу
    // Увімкніть HTTPS, якщо це необхідно, наприклад, для тестування функціоналу, що вимагає безпечного з'єднання:
    // https: true,
    allowedHosts: 'all', // Це дозволить доступ з будь-якого хоста
  }
})
