<script setup lang="ts">
/// <reference types="vite-svg-loader" />

import BiPen from 'bootstrap-icons/icons/pen.svg?component'
import { useQuery } from '@tanstack/vue-query';
import axios from 'axios';

const { isPending, isError, data, error } = useQuery({
  queryKey: ['docs'],
  queryFn: async (): Promise<SponsorList[]> => (await axios.get('/moneiz/admin/sponsors')).data,
})

</script>

<template>
  <div class="container">
    <div v-if="isPending">Loading...</div>
    <div v-else-if="isError">Error: {{ error.message }}</div>
    <div v-else>
      <div class="card" v-for="sponsor in data" :key="sponsor.id">
        <div class="card-body">
          <div class="title">
            <h5 class="card-title">{{ sponsor.name }}</h5>
            <button class="btn btn-primary" @click="edit(sponsor)">
              <BiPen />
            </button>

          </div>

          <div class="logo" v-if="sponsor.logo">
            <img :src="'/moneiz/admin/sponsors/' + sponsor.id + '/logo'" :alt="sponsor.name">
          </div>
        </div>
      </div>


    </div>


  </div>
</template>

<style scoped>

</style>