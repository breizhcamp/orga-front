<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <NavBar/>
  <main class="d-flex flex-nowrap">
    <div class="content bg-light-subtle">
      <RouterView />
    </div>
  </main>
  <VueQueryDevtools/>
</template>

<style scoped>
main {
  height: 100vh;
  height: -webkit-fill-available;
  min-height: 100vh;
  max-height: 100vh;
  margin-left: 220px;
  width: calc(100% - 220px);
}

.content {
    position: relative;
    width: 100%;
    overflow-y: auto;
}

/* Trick to have the box shadow only on the left side */
.content::before {
  content: "";
  position: fixed;
  top: 0;
  left: 220px;
  height: 100vh;
  width: 1em;
  box-shadow: inset 1em 0 1.5em -1em #0000001a, inset 0.5em 0 .5em -0.25em #00000026;
  pointer-events: none;
  z-index: 999;
}
</style>
