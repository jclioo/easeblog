<script setup>
import HelloWorld from './components/HelloWorld.vue'
//请求的网址
var url1 = "/jclioo/JhqlData/raw/master/d1.json";
//发起get请求
// var promise = fetch(url1,{
//     method: 'get',
//     headers: {
//       'Content-Type': 'application/json',
//     }
// }).then(function(response) {
//   //response.status表示响应的http状态码
//   if(response.status === 200){
//     //json是返回的response提供的一个方法,会把返回的json字符串反序列化成对象,也被包装成一个Promise了
//     console.log(response.json())
//     return response.json();
//   }else{
//     return {}
//   }
// });

import request from '../src/utils/http/request.js'
let data = request ({
  data: {
    url: url1,
    method: 'GET',
  }
})
data.then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})

request({
  data: {
    url: '/jclioo/JhqlData/raw/master/i2.json',
    method: 'GET',
    'Content-Type':'application/json;charset=UTF-8',
  }
}).then(({ data }) => {
  console.log(data)
}).catch(e => {
  console.log(e)
})

</script>

<template>
  <div>
    <a href="https://netlify.com" target="_blank">
      <img src="/fufu.jpg" class="logo" alt="Vite logo" />
    </a>
  </div>
  <h1>HelloWorld!!</h1>
  <HelloWorld msg="jclio 😀" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em rgba(100, 255, 237, 0.67));
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
