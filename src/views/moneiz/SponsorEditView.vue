<script setup lang="ts">
import SponsorBasicInfoForm from '@/components/moneiz/SponsorBasicInfoForm.vue'
import type { Sponsor } from '@/dto/moneiz/Sponsor'
import { getSponsor } from '@/queries/moneiz/sponsors.queries'
import { useMoneiz } from '@/utils/useAxios'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const moneiz = useMoneiz()

const sponsorId = computed(() => {
  const id = route.params.sponsorId as string | undefined
  return id === 'new' ? undefined : id
})
const isUpdateMode = computed(() => !!sponsorId.value)

// Initialize sponsor data
const sponsor = ref<Sponsor | undefined>()

const logoFile = ref<File | null>(null)
const basicInfoFormRef = ref<InstanceType<typeof SponsorBasicInfoForm> | null>(null)

// Load sponsor data if in update mode
const sponsorQuery = isUpdateMode.value && sponsorId.value
  ? getSponsor(sponsorId.value)
  : null

// Watch for data changes when loading existing sponsor
if (sponsorQuery) {
  watch(sponsorQuery.data, (newData) => {
    if (newData) {
      sponsor.value = newData
    }
  }, { immediate: true })
}

// Save function
const saveSponsor = async () => {
  // Validate form
  if (basicInfoFormRef.value && !basicInfoFormRef.value.validate()) {
    return
  }

  try {
    let savedSponsorId = sponsorId.value

    // Save sponsor basic info
    if (isUpdateMode.value && savedSponsorId) {
      // Update existing sponsor
      await moneiz.put(`/api/admin/sponsors/${savedSponsorId}`, sponsor.value)
    } else {
      // Create new sponsor
      const response = await moneiz.post('/api/admin/sponsors', sponsor.value)
      savedSponsorId = response.data.id
    }

    // Upload logo if a file was selected
    if (logoFile.value && savedSponsorId) {
      const formData = new FormData()
      formData.append('logo', logoFile.value)
      await moneiz.post(`/api/admin/sponsors/${savedSponsorId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    // Success - could add toast notification here
    console.log('Sponsor saved successfully')
  } catch (error) {
    console.error('Error saving sponsor:', error)
    // Could add error notification here
  }
}
</script>

<template>
  <div class="container-fluid py-4">
    <h1 class="ms-2 h2">{{ sponsor?.name }}</h1>
    <div class="sponsor-edit-grid">
      <!-- Basic Info Section -->
      <div class="grid-basic-info">
        <SponsorBasicInfoForm
          ref="basicInfoFormRef"
          v-model="sponsor"
          :sponsor-id="sponsorId"
          @update:logo-file="logoFile = $event"
        />
      </div>

      <!-- Invoice Info Section (placeholder) -->
      <div class="grid-invoice-info">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-3">Informations de facturation</h5>
            <p class="text-muted"><i>À venir...</i></p>
          </div>
        </div>
      </div>

      <!-- Contacts Section (placeholder) -->
      <div class="grid-contacts">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-3">Contacts</h5>
            <p class="text-muted"><i>À venir...</i></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="mt-4 d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-secondary" @click="$router.back()">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="saveSponsor">
        {{ isUpdateMode ? 'Mettre à jour' : 'Créer' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sponsor-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  grid-template-areas:
    'basic invoice'
    'contacts contacts';
}

.grid-basic-info {
  grid-area: basic;
}

.grid-invoice-info {
  grid-area: invoice;
}

.grid-contacts {
  grid-area: contacts;
}

.card-title {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}

@media (max-width: 768px) {
  .sponsor-edit-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'basic'
      'invoice'
      'contacts';
  }
}
</style>
