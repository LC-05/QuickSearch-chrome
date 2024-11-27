import Vue from 'vue'
import app from '../App.vue'
// import './css/index.less' //外部css和js建议在此引入
import $ from 'jquery'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'


var vm = new Vue({
    el:'#QuickSearch-chrome',
    render:c =>c(app),
})

