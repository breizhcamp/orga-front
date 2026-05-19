<script setup lang="ts">
import BiBoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import BiPen from 'bootstrap-icons/icons/pen.svg?component';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import type { SponsorList } from '@/dto/moneiz/SponsorList.ts';
import { useSponsorFile } from '@/queries/moneiz/sponsor-files.ts';

const props = defineProps<{
  sponsor: SponsorList;
}>();

const router = useRouter();

const logoRead = computed(() => {
  if (props.sponsor.logo) {
    return { sponsorId: props.sponsor.id, fileId: props.sponsor.logo };
  }
  return undefined;
});
const { fileUrl: logoUrl, isLoading: isLoadingLogo } = useSponsorFile(logoRead);

async function editSponsor() {
  await router.push({ name: 'SponsorEdit', params: { sponsorId: props.sponsor.id } });
}

</script>

<template>
  <div class="container card mb-1">
    <div class="row px-1 d-sm-flex" @click="editSponsor">

      <!-- Logo / Name Column -->
      <div class="col-sm-10 my-auto">
        <div class="sponsor-logo me-3 d-inline-block">
          <div v-if="isLoadingLogo && logoUrl" class="text-muted">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading logo...</span>
            </div>
          </div>
          <div v-else-if="logoUrl">
            <img :src="logoUrl" :alt="sponsor.name" />
          </div>
          <div v-else class="no-logo bg-body-secondary text-secondary d-inline-block">{{sponsor.name.substring(0, 2).toUpperCase()}}</div>
        </div>

        <span class="p-2">{{sponsor.name}}</span>
      </div>

      <div class="col-lg-1 col-sm-2 flex-fill text-end buttons my-auto">
        <a v-if="sponsor.url" :href="sponsor.url" target="_blank" class="btn btn-sm btn-outline-secondary"><BiBoxArrowUpRight /></a>
        <router-link :to="{ name: 'SponsorEdit', params: { sponsorId: sponsor.id } }" class="btn btn-sm btn-outline-primary ms-2">
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
  cursor: pointer;
}

div.row > div {
  padding: 1px 8px !important;
}

.sponsor-logo {
  vertical-align: middle;
  width: 16px;
}

.sponsor-logo img {
  max-width: 16px;
  max-height: 16px;
}

.no-logo {
  width: 16px;
  height: 16px;
  vertical-align: middle;
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
</style>
