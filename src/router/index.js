/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router'
//import HomeView from '../views/HomeView.vue'

const routes = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: HomeView
  // },
  {
    path: '/',
    name: 'main',
    meta: {layout: 'main'},
    component: () => import('../views/CalendarPage.vue')
  },
  {
    path: '/login',
    name: 'login',
    meta: {layout: 'Login'},
    component: () => import('../views/UserLogin.vue')
  },
  {
    path: '/session',
    name: 'mySession',
    meta: {layout: 'main'},
    component: () => import('../views/MySessionPage.vue')
  },
  {
    path: '/clients',
    name: 'clients',
    meta: {layout: 'main'},
    component: () => import('../views/AllClientPage.vue')
  },
  {
    path: '/support',
    name: 'support',
    meta: {layout: 'main'},
    component: () => import('../views/SupportPage.vue')
  },
  {
    path: '/bank-info',
    name: 'bank-info',
    meta: {layout: 'main'},
    component: () => import('../views/BankInformationPage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    meta: {layout: 'main'},
    component: () => import('../views/UserProfile.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
