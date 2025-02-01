<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { useStore } from 'vuex';

export default {
  name: 'App',
  setup() {
    const store = useStore();

    // Sayfa yenilendiğinde oturum kontrolü
    const user = localStorage.getItem('user');
    if (user) {
      store.dispatch('login', JSON.parse(user));
    }

    return {};
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
