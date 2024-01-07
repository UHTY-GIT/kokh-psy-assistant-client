// (utils/message.plugin.js)

// Імпортуємо 'M' з materialize-css
import M from 'materialize-css';

// Пишемо власний плагін для виводу сповіщень на екран materialize css
export default {
    install(app) {
        app.config.globalProperties.$message = function(html) {
            M.toast({ html });
        };

        app.config.globalProperties.$error = function(html) {
            M.toast({ html: `[Помилка]: ${html}` });
        };
    }
}
