// services/apiService.js
import axios from 'axios';

const BASE_URL = 'https://assistant.psy-kokh.online';
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

    // Функція для створення подій у календарі
    createEvent: async (token, name, clientId, customFormId, originType, date) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const formData = {
            name: name,
            client_id: clientId,
            custom_form_id: customFormId,
            originType: originType,
            date: date
        };
        const response = await axios.post(`${BASE_URL}/api/v1/events`, formData, config);
        return response.data; // повертаємо дані отримані з сервера
    },

    // Функція для отримання даних про події у календарі
    getEvents: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const response = await axios.get(`${BASE_URL}/api/v1/events`, config);
        return response.data; // повертаємо дані отримані з сервера
    },

    // Функція отримання даних сьогоднішніх сесій (консультацій)
    getConsultations: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const response = await axios.get(`${BASE_URL}/api/v1/consultations`, config);
        return response.data; // повертаємо дані отримані з сервера
    },

    // Функція відправки заповненої форми з активної сесії
    submitSessionAnswers: (payload) => {
        return axios.post(`${BASE_URL}/api/v1/answers`, JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    // Функція зміни паролю авторизованого користувача
    changePassword: (token, oldPassword, newPassword, confirmPassword) => {
        const config = {
            headers: { 'authtoken': token }
        };
        const formData = {
            old_password: oldPassword,
            new_password: newPassword,
            confirmation_password: confirmPassword
        };
        return axios.post(`${BASE_URL}/api/v1/psychologist_profile/change_password`, formData, config);
    },

    // Функція видалення події в календарі
    deleteEvent: async (token, eventId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const response = await axios.delete(`${BASE_URL}/api/v1/events/${eventId}`, config);
        return response.data;
    },

    // Функція для отримання нотаток
    getNotes: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const response = await axios.get(`${BASE_URL}/api/v1/notes`, config);
        return response.data;
    },

    // Функція для створення нотаток
    createNote: async (token, content) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const formData = {
            content: content
        };
        const response = await axios.post(`${BASE_URL}/api/v1/notes`, formData, config);
        return response.data;
    },

    // Функція для видалення нотаток
    deleteNote: async (token, noteId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const response = await axios.delete(`${BASE_URL}/api/v1/notes/${noteId}`, config);
        return response.data;
    },
};

export default apiService;