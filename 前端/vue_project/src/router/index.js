import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载
// import Login from '../components/login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
// import Home from '../components/hoem.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/hoem.vue')
// import Welcome from '../components/welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/welcome.vue')

// import Users from '../components/users/users.vue'
const Users = () => import(/* webpackChunkName: "users_roles_rights" */ '../components/users/users.vue')
// import Roles from '../components/roles/roles.vue'
const Roles = () => import(/* webpackChunkName: "users_roles_rights" */ '../components/roles/roles.vue')
// import Rights from '../components/power/rights.vue'
const Rights = () => import(/* webpackChunkName: "users_roles_rights" */ '../components/power/rights.vue')

// import Cate from '../components/goods/cate.vue'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/cate.vue')
// import Params from '../components/goods/params.vue'
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/params.vue')

// import List from '../components/goods/list.vue'
const List = () => import(/* webpackChunkName: "list_add" */ '../components/goods/list.vue')
// import Add from '../components/goods/add.vue'
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/goods/add.vue')

// import Order from '../components/order/order.vue'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/order.vue')
// import Report from '../components/report/report.vue'
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login', component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]
const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从哪个路径来的
  // next是一个函数 表示放行
  // next（） 放行 next('/login') 强制跳转

  if (to.path === '/login') return next()

  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
