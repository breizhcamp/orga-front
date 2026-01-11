<script setup lang="ts">
import type { SponsorList } from '@/dto/moneiz/SponsorList.ts'
import BiPen from 'bootstrap-icons/icons/pen.svg?component'
import BiBoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component'
import { useRouter } from 'vue-router'
import { useSponsorFile } from '@/queries/moneiz/sponsor-files.ts'
import { computed } from 'vue'

const props = defineProps<{
  sponsor: SponsorList,
}>()

const router = useRouter()

const logoRead = computed(() => {
  if (props.sponsor.logo) {
    return { sponsorId: props.sponsor.id, fileId: props.sponsor.logo }
  }
  return undefined
})
const { fileUrl: logoUrl, isLoading: isLoadingLogo } = useSponsorFile(logoRead)

function editSponsor() {
  router.push({ name: 'SponsorEdit', params: { sponsorId: props.sponsor.id } })
}

</script>

<template>
  <div class="container">
    <div class="row d-sm-flex" @click="editSponsor">

      <!-- Logo / Name Column -->
      <div class="col-sm-10">
        <div class="sponsor-logo">
          <div v-if="isLoadingLogo && logoUrl" class="text-muted">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading logo...</span>
            </div>
          </div>
          <div v-else-if="logoUrl">
            <img :src="logoUrl" :alt="sponsor.name" />
          </div>
          <div v-else class="no-logo">{{sponsor.name.substring(0, 2).toUpperCase()}}</div>
        </div>

        <span class="p-2">{{sponsor.name}}</span>
      </div>


      <div class="col-lg-1 col-sm-2 flex-fill text-end buttons">
        <a v-if="sponsor.url" :href="sponsor.url" target="_blank" class="btn btn-sm btn-light"><BiBoxArrowUpRight /></a>
        <router-link :to="{ name: 'SponsorEdit', params: { sponsorId: sponsor.id } }" class="btn btn-sm btn-outline-primary">
          <BiPen />
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
div.row {
  position: relative;
  min-height: 56px;
  margin-bottom: 2px !important;
  cursor: pointer;
  border: 1px #c0c0c0 solid;
  padding: 0 2px;
  background-color: #f5f7fa;
}

div.row > div {
  padding: 1px 8px !important;
  margin: auto 0;
}

.sponsor-logo {
  margin-right: 15px;
  display: inline-block;
  vertical-align: middle;
  width: 16px;
}

.sponsor-logo img {
  max-width: 16px;
  max-height: 16px;
  opacity: 0.7;
}

.no-logo {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
  background-color: #ededed;
  color: #c6c6c6;
  text-align: center;
  line-height: 16px;
  font-weight: bold;
  border-radius: 8px;
  font-size: 50%;
}

@media (min-width: 576px) {
  .sponsor-logo .spinner-border {
    margin-left: 10px;
  }

  .sponsor-logo {
    width: 40px;
    padding-left: 0.5rem;
  }

  .sponsor-logo img {
    max-width: 40px;
    max-height: 40px;
  }

  .no-logo {
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    margin-right: 5px;
    font-size: 100%;
  }
}

@media (max-width: 575.98px) {
  .buttons {
    position: absolute;
    top: 5px;
  }
}

.btn {
  margin-left: 10px;
  border-color: lightgrey;
}
</style>
