import { createRouter, createWebHistory } from "vue-router";
import HomePage from '../views/HomePage.vue';
import AdminPanel from '../views/AdminPanel.vue';
import LoginPage from "../views/LoginPage.vue";
import store from '../store';

const routes = [
  { 
    path: "/", 
    name: "LoginPage", 
    component: LoginPage 
  },
  { 
    path: '/home', 
    name: 'HomePage', 
    component: HomePage 
  },
  { 
    path: "/admin", 
    name: "AdminPanel", 
    component: AdminPanel 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.path === '/admin' && !store.getters.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
