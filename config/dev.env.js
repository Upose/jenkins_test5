/*
 * @Description: 
 * @Author: gongqin
 * @Date: 2022-03-18 10:36:32
 * @LastEditors: gongqin
 * @LastEditTime: 2022-10-12 17:31:50
 */
'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_FILE_URL: 'http://192.168.21.46/cdn/',
  // VUE_APP_FILE_URL:'http://192.168.21.46/cdn/',//图片路径、域名前缀
  VUE_APP_template_url:'"http://192.168.21.71:9000"',//模板路径名
  VUE_APP_BASE_API:'"http://192.168.21.46:8000"',//请求地址
  VUE_TMP_URL: '"http://192.168.21.46:80/cdn/"',
})
