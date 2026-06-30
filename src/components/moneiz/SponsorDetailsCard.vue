<script setup lang="ts">
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import { computed } from 'vue';

import type { SponsoringSponsorRes } from '@/dto/moneiz/SponsoringRes';
import { useSponsorFile } from '@/queries/moneiz/sponsor-files';

import CardText from '../CardText.vue';
import CardTitle from '../CardTitle.vue';

const props = defineProps<{
  sponsor: SponsoringSponsorRes | undefined;
  loading: boolean;
}>();
console.assert(props.loading || props.sponsor);

const logoRead = computed(() => {
  if (!props.sponsor?.logo) return undefined;
  return {
    sponsorId: props.sponsor.id,
    fileId: props.sponsor.logo,
  };
});

const {
  fileUrl: logoUrl,
  isLoading: isLogoLoading,
  error: logoError,
} = useSponsorFile(logoRead);
</script>

<template>
  <div
    class="card"
    :aria-hidden="loading"
  >
    <div
      v-if="loading || isLogoLoading || logoError"
      class="bg-secondary rounded-top ratio ratio-1x1"
    ></div>
    <img
      v-else
      :src="logoUrl"
      alt=""
      class="bg-light card-img-top"
    />
    <div class="card-body">
      <CardTitle :loading="loading">
        Sponsor : {{ sponsor?.name }}
      </CardTitle>
      <CardText
        v-if="loading || sponsor?.url"
        :loading="loading"
        placeholder-class="col-8"
      >
        <span class="fw-medium">
          Url :
        </span>
        <a :href="sponsor?.url" target="_blank">
          {{ sponsor?.url }}
        </a>
      </CardText>
      <button
        v-if="loading"
        class="btn btn-primary disabled placeholder"
        style="width: 115px;"
        disabled="true"
        aria-disabled="true"
      ></button>
      <RouterLink
        v-else
        class="btn btn-primary"
        :to="{ name: 'SponsorEdit', params: { sponsorId: sponsor?.id } }"
      >
        <BiPencilSquare class="me-2" />
        Modifier
      </RouterLink>
    </div>
  </div>
</template>
