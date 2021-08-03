import Vue from 'vue'
import VueRouter from 'vue-router'
import Registration from "@/components/Registration.vue";
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import StudyMaterial from "@/components/StudyMaterial.vue";
import HelloWorld from "@/components/HelloWorld.vue";


Vue.use(VueRouter)

  const routes = [
  {
    path: '/hello',
    name: 'hello',
    component: HelloWorld
  },
  {
    path: '/signup',
    name: 'signup',
    component: Registration
  },
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/dashboard/:userid',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/studymaterial/:smid/:userid',
    name: 'StudyMaterial',
    component: StudyMaterial
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach((to, from, next) => {
  if (from.query.token && !to.query.token) {
    if (to.path === from.path) {
      // console.log('Identical routes detected')
      return // This is a no-no via the documentation, but a bug in routing to identical routes strips query params, and this prevents that
    }
    next({path: to.path, query: {token: from.query.token}})
  }

  next()
})

export default router
