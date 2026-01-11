<script setup lang="ts">
import SponsorBasicInfoForm from '@/components/moneiz/SponsorBasicInfoForm.vue'
import type { Sponsor } from '@/dto/moneiz/Sponsor'
import { getSponsor, useCreateSponsorMutation, useUpdateSponsorMutation, useUploadSponsorLogoMutation } from '@/queries/moneiz/sponsors.queries'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Initialize mutations
const createSponsorMutation = useCreateSponsorMutation()
const updateSponsorMutation = useUpdateSponsorMutation()
const uploadLogoMutation = useUploadSponsorLogoMutation()

const sponsorId = computed(() => {
  const id = route.params.sponsorId as string | undefined
  return id === 'new' ? undefined : id
})
const isUpdateMode = computed(() => !!sponsorId.value)

// Initialize sponsor data
const sponsor = ref<Sponsor | undefined>()
const dataInitialized = ref(false)

const logoFile = ref<File | null>(null)
const basicInfoFormRef = ref<InstanceType<typeof SponsorBasicInfoForm> | null>(null)

// Load sponsor data if in update mode
const sponsorQuery = isUpdateMode.value && sponsorId.value
  ? getSponsor(sponsorId.value, true)
  : undefined

// Watch for data changes when loading existing sponsor
// Only initialize data once to preserve user edits during the editing session
if (sponsorQuery) {
  watch(sponsorQuery.data, (newData) => {
    if (newData && !dataInitialized.value) {
      sponsor.value = { ...newData }
      dataInitialized.value = true
    }
  }, { immediate: true })
}

const disabled = computed(() =>
  createSponsorMutation.isPending.value ||
  updateSponsorMutation.isPending.value ||
  uploadLogoMutation.isPending.value ||
  (sponsorQuery?.isPending?.value ?? false)
)

// Save function
const saveSponsor = async () => {
  if (!sponsor.value) return
  // Validate form
  if (basicInfoFormRef.value && !basicInfoFormRef.value.validate()) {
    return
  }

  try {
    let savedSponsorId = sponsorId.value

    // Save sponsor basic info
    if (isUpdateMode.value && savedSponsorId) {
      // Update existing sponsor
      await updateSponsorMutation.mutateAsync({ id: savedSponsorId, sponsor: sponsor.value })
    } else {
      // Create new sponsor
      const result = await createSponsorMutation.mutateAsync(sponsor.value)
      savedSponsorId = result.id
      await router.replace({ name: 'SponsorEdit', params: { sponsorId: savedSponsorId } })
    }

    // Upload logo if a file was selected and we have a sponsor ID
    if (logoFile.value && savedSponsorId) {
      const logoResult = await uploadLogoMutation.mutateAsync({
        sponsorId: savedSponsorId,
        file: logoFile.value
      })
      if (sponsor.value) {
        sponsor.value.logo = logoResult.id
      }
    }

    // Success - could add toast notification here
    console.log('Sponsor saved successfully', savedSponsorId)
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
          :disabled="disabled"
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
      <button type="button" class="btn btn-secondary" @click="$router.back()" :disabled="disabled">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="saveSponsor" :disabled="disabled">
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
