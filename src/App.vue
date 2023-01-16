<script setup>
import HelloWorld from './components/HelloWorld.vue'
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
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
