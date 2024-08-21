/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'main',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/CalendarPage.vue')
  },
  {
    path: '/login',
    name: 'login',
    meta: { layout: 'Login', requiresAuth: false },
    component: () => import('../views/UserLogin.vue')
  },
  {
    path: '/session',
    name: 'mySession',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/MySessionPage.vue')
  },
  {
    path: '/clients',
    name: 'clients',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/AllClientPage.vue')
  },
  {
    path: '/support',
    name: 'support',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/SupportPage.vue')
  },
  {
    path: '/bank-info',
    name: 'bank-info',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/BankInformationPage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/UserProfile.vue')
  },
  {
    path: '/bank-info/add',
    name: 'AddTemplate',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/TemplateForm.vue')
  },
  {
    path: '/send-form',
    name: 'SendForm',
    meta: { layout: 'forms', requiresAuth: false },
    component: () => import('../components/form/SendFormPage.vue')
  },
  {
    path: '/thank-you',
    name: 'ThankYou',
    meta: { layout: 'forms', requiresAuth: false },
    component: () => import('../views/ThankYouPage.vue')
  },
  {
    path: '/active-session',
    name: 'ActiveSession',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/ActiveSessionPage.vue')
  },
  {
    path: '/view-client-info/:id',
    name: 'ClientInformation',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/ClientInformationPage.vue'),
    props: true,
  },
  {
    path: '/view-templates/:id',
    name: 'ViewsTemplatesBankInformationPage',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/ViewsTemplatesBankInformationPage.vue'),
    props: true,
  },
  {
    path: '/view-one-session/:id',
    name: 'ViewOneSession',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/OneSessionPage.vue'),
    props: true,
  },
  {
    path: '/couple-cycle/:id',
    name: 'CoupleCycle',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('../views/CoupleCyclePage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Використання глобального навігаційного хука beforeEach для перевірки автентифікації користувача
router.beforeEach((to, from, next) => {
  // Перевірка, чи маршрут вимагає аутентифікації
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Перевірка наявності токена аутентифікації
    const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
      console.log('Є токент?' + isAuthenticated)
      // Якщо користувач не аутентифікований, перенаправлення на сторінку входу
      // window.location.href = 'https://crm-assistant.psy-kokh.online/login?message=redirect';
      //window.location.href = 'https://crm-assistant.psy-kokh.online/';
      next({
        path: '/login',
        //query: { message: 'redirect' } // Збереження маршруту для можливого перенаправлення після входу
      });
    } else {
      // Якщо аутентифікований, продовження навігації
      next();
    }
  } else {
    // Якщо маршрут не вимагає аутентифікації, просто продовження навігації
    next();
  }
})

export default router
