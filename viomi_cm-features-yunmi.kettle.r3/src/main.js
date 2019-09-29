// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './common/store'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import { AjaxPlugin } from 'vux';
// import './common/nativeBridge'

Vue.use(AjaxPlugin)
Vue.use(VueRouter)

const routes = [{
  path: '/22608',
  meta: {
    title: '云米智能即热饮水吧'
  },
  component : (resolve,reject) => {
    require(['./business/kettle/kettle.vue'],resolve,reject);
  }
}]

const router = new VueRouter({
  routes
})

FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app-box')
