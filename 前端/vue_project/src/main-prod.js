import Vue from 'vue'
import App from './App.vue'
import router from './router'
//import './plugins/element.js'

// 导入全局样式
import './assets/css/globale.css'
// 导入字体样式
import './assets/fonts/iconfont.css'

// 导入第三方tree插件
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入Nprogress 包
import NProgress from 'nprogress'

// 导入axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 添加axios请求拦截
// 在require 拦截器，显示进度条
axios.interceptors.request.use(config => {
  NProgress.start()
  // 为请求头对象，添加Token 验证 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response 拦截器，隐藏进度条
axios.interceptors.request.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 全局使用富文本编辑器
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
