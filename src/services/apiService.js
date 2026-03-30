// services/apiService.js
import axios from 'axios';

const BASE_URL = 'https://assistant.psy-kokh.online';
//const BASE_URL = 'https://development-assistant.psy-kokh.online';
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

    //Функція для відображення всіх клієнтів (по типам, якщо не передавати тип, тоді всі відображаються, якщо передавати, тоді якийсь один)
    getClientsPagination: async (token, params = {}) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
            params: params,
        };

        const response = await axios.get(`${BASE_URL}/api/v1/clients`, config);
        return response.data;
    },

    //Функція для відображення всіх клієнтів
    getClientsAll: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            }
        };

        const response = await axios.get(`${BASE_URL}/api/v1/clients/list`, config);
        return response.data;
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
            answerable_type: answerableType, //Consultation, PrimaryPoll, InformationConsent, CoupleCycle, CaseDescription
            answers_data: answers,
        };


        return axios.post(`${BASE_URL}/api/v1/answers`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    // Тимчасова функція для видалення відповіді (поля)
    deleteAnswer: async (token, answerId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.delete(`${BASE_URL}/api/v1/answers/${answerId}`, config);
        return response.data;
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

    // Функція для надсилання на телеграм бота конфігу з позначкою що сесія успішно завершена (для супервізії)
    sendSessionSupervisorEndNotification: async (clientTelegramId) => {
        const response = await axios.post(`${BASE_URL_TELEGRAM}/session_supervisor_end`, {
            client_id: clientTelegramId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    },

    // Функція для сповіщення бота про необхідність заповнити опис кейсу
    notifyCaseFill: async (clientTelegramId) => {
        const response = await axios.post(`${BASE_URL_TELEGRAM}/notify_case_fill`, {
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

    // Функція для оновлення даних івента у календарі (консультації)
    updateConsultationCalendar: async (token, consultationId, consultationData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            }
        };

        const payload = {
            id: consultationId,
            consultation_date: consultationData.date,
        };

        const response = await axios.patch(`${BASE_URL}/api/v1/consultations/${consultationId}`, payload, config);
        return response.data;
    },

    // Функція для видалення сесії зі сторінки Мої сесії
    deleteClientConsultation: async (token, consultationId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.delete(`${BASE_URL}/api/v1/consultations/${consultationId}`, config);
        return response.data;
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

    // Функція для відправки оновлених даних сесії
    sendEditedConsultation: (payload, token) => {
        return axios.patch(`${BASE_URL}/api/v1/answers`, payload, {
            headers: {
                "Content-Type": "application/json",
                authtoken: token
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

    // Функція для створення оцінки експерта
    createExpertAssessment: async (token, clientId, content) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };

        const payload = {
            client_id: clientId,
            content: content,
        };

        const response = await axios.post(`${BASE_URL}/api/v1/expert_assessments`, payload, config);
        return response.data;
    },


    // Функція для отримання даних оцінки експерта
    getExpertAssessments: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
            params: {
                client_id: clientId,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/expert_assessments`, config);
        return response.data;
    },

    // Функція для створення дайджеста психотерапевтичних думок
    createDigestPsyMind: async (token, clientId, content) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };

        const payload = {
            client_id: clientId,
            content: content,
        };

        const response = await axios.post(`${BASE_URL}/api/v1/digest_opinions`, payload, config);
        return response.data;
    },

    // Функція для створення опису кейсу (для супервізії)
    createCaseDescription: async (token, title, clientId, psychologistId, customFormId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const payload = {
            title: title,
            client_id: clientId,
            psychologist_id: psychologistId,
            custom_form_id: customFormId
        };
        const response = await axios.post(`${BASE_URL}/api/v1/case_descriptions`, payload, config);
        return response.data;
    },


    // Функція для отримання даних дайджеста психотерапевтичних думок
    getDigestPsyMind: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
            params: {
                client_id: clientId,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/digest_opinions`, config);
        return response.data;
    },

    //Функція для відображення всіх заархівованих клієнтів
    getArchiveClients: (token) => {
        return axios.get(`${BASE_URL}/api/v1/clients/archive`, {
            headers: { 'authtoken': token }
        });
    },

    // Функція архівування клієнтів
    AddArchiveClient: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.post(`${BASE_URL}/api/v1/clients/${clientId}/soft_delete`, {}, config);
        return response.data;
    },

    // Функція розархівування клієнтів
    RestoreArchiveClient: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.post(`${BASE_URL}/api/v1/clients/${clientId}/restore`, {}, config);
        return response.data;
    },

    // Функція отримання сесій конкретного клієнта
    getClientConsultations: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}/consultations`, config);
        return response.data;
    },

    // Функція для отримання статистики з первинного опитування
    getPrimaryPollStatistics: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };

        const response = await axios.get(`${BASE_URL}/api/v1/statistics/primary_polls`, config);
        return response.data;
    },

    // Функція для отримання статистики з консультацій (Патерн самозахисту)
    getConsultationStatistics: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };

        const response = await axios.get(`${BASE_URL}/api/v1/statistics/consultations`, config);
        return response.data;
    },

    // Функція для отримання даних для графіків статистики клієнтів
    getClientPortrait: async (token) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };

        const response = await axios.get(`${BASE_URL}/api/v1/graphics/client_portrait`, config);
        return response.data;
    },

    // Функція для отримання навичок EFCT (Mock)
    getEfctSkills: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            }
        };

        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}/efct_skills`, config);
        return response.data;
    },

    // Функція для отримання опису кейсу
    getCaseDescription: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
            params: {
                client_id: clientId,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/case_descriptions`, config);
        return response.data;
    },

    // Функція для створення/оновлення бонусу для пари
    createOrUpdateBonusForCouple: async (token, clientId, text) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const payload = {
            client_id: clientId,
            text: text
        };
        const response = await axios.post(`${BASE_URL}/api/v1/bonus_of_couple_cycle`, payload, config);
        return response.data;
    },

    // Функція для отримання посилань з відеоматеріалами
    getClientAssets: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/clients/${clientId}/assets`, config);
        return response.data;
    },

    // Функція для отримання бонусу для пари
    getBonusForCouple: async (token, clientId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authtoken': token,
            },
            params: {
                client_id: clientId,
            },
        };
        const response = await axios.get(`${BASE_URL}/api/v1/bonus_of_couple_cycle`, config);
        return response.data;
    }
};

export default apiService;