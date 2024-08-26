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
    submitAnswers: (clientId, answerableId, answerableType, answers) => {
        const payload = {
            client_id: clientId,
            answerable_id: answerableId,
            answerable_type: answerableType,
            answers_data: answers,
        };

        return axios.post(`${BASE_URL}/api/v1/answers`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
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

    // Функція для реєстрації первинного опитування клієінта, повертає id первинки яке привязане до клієнта
    registerClientPrimaryPoll: async (clientId) => {
        const response = await axios.post(`${BASE_URL}/api/v1/primary_polls`, {
            client_id: clientId,
        });
        return response;
    },

    // Функція для реєстації інформованої згоди клієнта,  повертає id інформовваної згоди яке привязане до клієнта
    registerClientInformationConsents: async (clientId) => {
        const response = await axios.post(`${BASE_URL}/api/v1/information_consents`, {
            client_id: clientId,
        });
        return response;
    },

    // Функція для встановлення пари клієнта
    updateClientСoupleData: async (clientId, data, token) => {
        const response = await axios.patch(`${BASE_URL}/api/v1/clients/${clientId}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        });
        return response.data;
    },

    // Функція для отримання даних одного клієнта
    getClientById: async (token, clientId) => {
        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}`, {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        });
        return response.data;
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

    // Функція для надсилання на телеграм бота конфігу з позначкою що сесія успішно завершена
    sendSessionEndNotification: async (clientTelegramId) => {
        const response = await axios.post(`${BASE_URL_TELEGRAM}/session_end`, {
            client_id: clientTelegramId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
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
            origin_type: originType,
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

    // Функція отримання даних з конкретної завершеної сесії (консультації)
    getOneConsultation: async (token, id) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token // передача токена в заголовках
            }
        };
        const response = await axios.get(`${BASE_URL}/api/v1/consultations/${id}`, config);
        return response.data; // повертаємо дані отримані з сервера
    },

    // Функція відправки заповненої форми з активної сесії
    submitSessionAnswers: (payload, token) => {
        return axios.post(`${BASE_URL}/api/v1/answers`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
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

    // Функція для створення циклу пари для отримання couple_cycle_id
    createCoupleCycle: async (token, customFormId, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token
            }
        };

        const formData = {
            custom_form_id: customFormId, // ID кастомної форми
            client_id: clientId,          // ID основного клієнта
            //couple_client_id: coupleClientId // ID клієнта-партнера
        };

        const response = await axios.post(`${BASE_URL}/api/v1/couple_cycles`, formData, config);
        return response.data;
    },

    // Функція для надсилання полів циклу пари
    submitCoupleCycleAnswers: async (token, clientId, coupleCycleId, answers) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };

        const payload = {
            client_id: clientId,
            answerable_id: coupleCycleId,
            answerable_type: 'CoupleCycle',
            answers_data: answers,
        };

        const response = await axios.post(`${BASE_URL}/api/v1/answers`, payload, config);
        return response.data;
    },

    // Функція для отримання даних циклу пари
    getCoupleCycleData: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}/couple_cycle`, config);
        return response.data;
    },

    // Функція для отримання даних первинного опитування
    getPrimaryPollData: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}/primary_poll`, config);
        return response.data;
    },

    // Функція для отримання даних інформованої згоди
    getInformationConsentData: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}/information_consent`, config);
        return response.data;
    },

};

export default apiService;