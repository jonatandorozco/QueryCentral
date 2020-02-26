import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/app',
    name: 'app',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/add-connection',
    name: 'add-connection',
    component: () => import('../views/AddConnection.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
