<script setup lang="ts">
/// <reference types="vite-svg-loader" />

import { listSponsors } from '@/queries/moneiz/sponsors.queries.ts';
import BiPen from 'bootstrap-icons/icons/pen.svg?component'

const { isPending, isError, data, error } = listSponsors()

</script>

<template>
  <div class="container">
    <div v-if="isPending">Loading...</div>
    <div v-else-if="isError">Error: {{ error?.message }}</div>
    <div v-else>
      <div class="card" v-for="sponsor in data" :key="sponsor.id">
        <div class="card-body">
          <div class="title">
            <h5 class="card-title">{{ sponsor.name }}</h5>
            <button class="btn btn-primary">
              <BiPen />
            </button>
          </div>

          <div class="logo" v-if="sponsor.logo">
            <!--img :src="'/moneiz/admin/sponsors/' + sponsor.id + '/logo'" :alt="sponsor.name"-->
          </div>
        </div>
      </div>


    </div>


  </div>
</template>

<style scoped>

</style>
