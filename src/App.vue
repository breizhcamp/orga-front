<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <main class="d-flex flex-nowrap">
    <NavBar/>

    <div class="content">
      <RouterView />
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  height: -webkit-fill-available;
  min-height: 100vh;
  max-height: 100vh;
}

.content {
    position: relative;
    background-color: rgb(248, 249, 250);
    width: 100%;
}

/* Trick to have the box shadow only on the left side */
.content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 1em;
  box-shadow: inset 1em 0 1.5em -1em #0000001a, inset 0.5em 0 .5em -0.25em #00000026;
  pointer-events: none;
}
</style>
