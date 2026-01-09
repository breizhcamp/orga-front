<template>
  <header>
    <nav class="navbar navbar-expand-lg">
      <div class="ms-2" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/moneiz/sponsorings" class="nav-link" active-class="active">Sponsorings</router-link>
          </li>
          <li class="nav-item dropdown">
            <router-link to="/moneiz/sponsors" class="nav-link" active-class="active">Sponsors</router-link>
          </li>
        </ul>
      </div>

    </nav>
  </header>

  <router-view />
</template>

<script setup lang="ts">
</script>

<style scoped>
.navbar {
  border-bottom: 1px solid #dee2e6;
  padding: 0.5rem;
}

</style>
