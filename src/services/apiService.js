// services/apiService.js
import axios from 'axios';

const BASE_URL = 'http://assistant.psy-kokh.online:3000';
const BASE_URL_TELEGRAM = 'https://psykokhbot.herokuapp.com';

const apiService = {
    // Функція для входу користувача
    loginUser: (email, password) => {
        return axios.post(`${BASE_URL}/api/v1/psychologist_sessions`, {
            email: email,
            password: password
        });
    },

    //Функція для завантаження  даних профілю
    async getUserProfile(token) {
        const config = {
            headers: { 'authtoken': token },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/psychologist_profile/profile`, config);
        return response.data;
    },

    //Функція для відображення всіх клієнтів
    getClients: (token) => {
        return axios.get(`${BASE_URL}/api/v1/clients`, {
            headers: { 'authtoken': token }
        });
    },

    //Функція для шаблонів
    //Функція для створення назви нової кастомної форми
    createCustomForm: (token, title, formType) => {
        const config = {
            headers: { 'authtoken': token }
        };
        const formData = {
            title: title,
            form_type: formType
        };
        return axios.post(`${BASE_URL}/api/v1/custom_forms`, formData, config);
    },
    // Функція для створення нового елемента кастомної форми
    createFormItem: (token, customFormId, formItemsData) => {
        const config = {
            headers: {
                'authtoken': token,
                'Content-Type': 'application/json'
            }
        };
        // Отримуємо вже готовий JSON з масиву об'єктів
        const formData = {
            custom_form_id: customFormId,
            form_items_data: formItemsData
        };
        // Відправляємо JSON напряму, без використання FormData
        return axios.post(`${BASE_URL}/api/v1/form_items`, JSON.stringify(formData), config);
    },

    //Функція для відображення всіх шаблонів
    getForms: (token) => {
        return axios.get(`${BASE_URL}/api/v1/custom_forms`, {
            headers: { 'authtoken': token }
        });
    },

    //Функція для отримання даних форми по id (насилання через Url)
    getCustomFormById: (formId) => {
        return axios.get(`${BASE_URL}/api/v1/custom_forms/${formId}`);
    },

    //Функція для надсилання полів форми користувача
    submitAnswers: (payload) => {
        return axios.post(`${BASE_URL}/api/v1/answers`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    // Функція для відправки true/false для інформаованої згоди
    updateClientInformAgree: async (clientId, wasAgreed) => {
        const response = await axios.post(`${BASE_URL}/api/v1/clients/${clientId}/client_info`, {
            was_agreed: wasAgreed,
        });
        return response;
    },

    // Функція для відправки true/false для первинного опитування
    updateClientPrimaryPoll: async (clientId, primaryPollComplete) => {
        const response = await axios.post(`${BASE_URL}/api/v1/clients/${clientId}/client_info`, {
            primary_poll_complete: primaryPollComplete,
        });
        return response;
    },

    // Функція для надсилання посилання у телеграм бот
    sendTelegramTemplate: async (clientId, url) => {
        const response = await axios.post(`${BASE_URL_TELEGRAM}/send_template`, {
            client_id: clientId,
            url: url,
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response;
    },
};

export default apiService;