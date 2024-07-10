<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-secondary">
      <div class="d-flex flex-row flex-grow-1 align-items-center ms-2">
        <div v-if="subView">
          <RouterLink :to="parentRoute" custom v-slot="{ navigate }">
            <button 
              type="button" 
              class="btn btn-dark"
              role="link"
              @click="navigate"
            >Back to {{ parentTitle }}</button>
          </RouterLink>
        </div>
        <h2 class="navbar-brand text-white mx-2 my-1">
          {{ title }}
        </h2>
      </div>

      <div v-if="actions.length">
        <ul class="navbar-nav">
          <li v-for="action in actions" class="nav-item" v-bind:key="action.label">
            <button type="button" class="d-flex align-items-center btn btn-dark me-2" v-on:click="action.function()">
              <component class="me-1" v-if="action.icon != undefined" :is="action.icon" aria-hidden="true"/>
              <span>{{ action.title }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Action } from '@/dto/Action';

export default defineComponent({
  name: "ToolBar",

  props: {
    title: { type: String, required: true },
    actions: { type: Array<Action>, required: true },
    subView: { type: Boolean, required: false, default: false },
    parentTitle: { type: String, required: false } ,
    parentRoute: { type: String, required: false, default: "" }
  }
})
</script>

<style scoped>
.container {
  margin-left: 0;
  margin-right: 0;
}
</style>