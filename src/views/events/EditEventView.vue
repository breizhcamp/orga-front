<script setup lang="ts">
import EventIdInput from '@/components/events/EventIdInput.vue';
import type { Event } from '@/dto/kalon/Event'
import { useEventStore } from '@/stores/event'
import { useKalon } from '@/utils/useAxios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const kalon = useKalon()
const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

// Determine if we're creating or updating
const eventId = computed(() => {
  const id = route.params.eventId as string | undefined
  return id === 'new' ? undefined : id
})
const isUpdateMode = computed(() => !!eventId.value)

// Form data
const formData = ref<Partial<Event>>({
  name: '',
  startDate: '',
  endDate: '',
  website: '',
  venue: ''
})

// UI state
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// Event ID state (only for create mode)
const eventIdValue = ref('')
const isEventIdAvailable = ref(false)

// Form validation
const formErrors = ref<Record<string, string>>({})

// Handle event ID validity changes
function handleIdValidityChange(isValid: boolean) {
  isEventIdAvailable.value = isValid
}

// Load existing event data in update mode
async function loadEvent() {
  if (!eventId.value) return

  try {
    loading.value = true
    error.value = null
    const resp = await kalon.get<Event>(`/events/${eventId.value}`)
    formData.value = { ...resp.data }
  } catch (e) {
    console.error('Erreur de chargement de l\'événement', e)
    error.value = 'Impossible de charger l\'événement'
  } finally {
    loading.value = false
  }
}

// Validate form
function validateForm(): boolean {
  formErrors.value = {}
  let isValid = true

  if (!formData.value.name?.trim()) {
    formErrors.value.name = 'Le nom est requis'
    isValid = false
  }

  // Validate event ID in create mode
  if (!isUpdateMode.value) {
    if (!eventIdValue.value) {
      formErrors.value.id = 'L\'identifiant est requis'
      isValid = false
    } else if (!isEventIdAvailable.value) {
      formErrors.value.id = 'L\'identifiant n\'est pas disponible'
      isValid = false
    }
  }

  if (!formData.value.startDate) {
    formErrors.value.startDate = 'La date de début est requise'
    isValid = false
  }

  if (!formData.value.endDate) {
    formErrors.value.endDate = 'La date de fin est requise'
    isValid = false
  }

  // Validate that end date is after start date
  if (formData.value.startDate && formData.value.endDate) {
    if (formData.value.endDate < formData.value.startDate) {
      formErrors.value.endDate = 'La date de fin doit être après la date de début'
      isValid = false
    }
  }

  // Validate website URL if provided
  if (formData.value.website && formData.value.website.trim()) {
    try {
      new URL(formData.value.website)
    } catch {
      formErrors.value.website = 'URL invalide'
      isValid = false
    }
  }

  return isValid
}

// Submit form
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true
    error.value = null
    success.value = false

    const payload: Partial<Event> = {
      name: formData.value.name?.trim(),
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      website: formData.value.website?.trim() || undefined,
      venue: formData.value.venue?.trim() || undefined
    }

    if (isUpdateMode.value) {
      // Update existing event
      const updatePayload = {
        ...payload,
        id: eventId.value
      }
      await kalon.put(`/events/${eventId.value}`, updatePayload)
    } else {
      // Create new event - include the ID
      const createPayload = {
        ...payload,
        id: eventIdValue.value
      }
      await kalon.post<Event>('/events', createPayload)
    }

    success.value = true
    await eventStore.loadEvents(kalon)
    setTimeout(() => { router.push('/') }, 2000)

  } catch (e) {
    console.error('Erreur lors de la soumission', e)
    const axiosError = e as { response?: { data?: { message?: string } } }
    error.value = axiosError.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde'
  } finally {
    submitting.value = false
  }
}

// Cancel and go back
function handleCancel() {
  router.go(-1)
}

onMounted(() => {
  if (isUpdateMode.value) {
    loadEvent()
  }
})
</script>

<template>
  <div class="container py-3">
    <!-- Header -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <h1 class="h3 mb-1">{{ isUpdateMode ? 'Modifier l\'événement' : 'Créer un événement' }}</h1>
        <p class="text-muted mb-0">{{ isUpdateMode ? 'Modifiez les informations de l\'événement' : 'Créez un nouvel événement' }}</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex align-items-center gap-2 mb-4 text-secondary">
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span>Chargement de l'événement…</span>
    </div>

    <!-- Form -->
    <div v-else class="card border-0 shadow-sm">
      <div class="card-body">
        <!-- Success message -->
        <div v-if="success" class="alert alert-success d-flex align-items-center mb-4" role="alert">
          <svg class="me-2" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <div>
            {{ isUpdateMode ? 'Événement mis à jour avec succès !' : 'Événement créé avec succès !' }}
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <svg class="me-2" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>{{ error }}</div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Name field -->
          <div class="mb-3">
            <label for="event-name" class="form-label">
              Nom de l'événement <span class="text-danger">*</span>
            </label>
            <input
              id="event-name"
              v-model="formData.name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': formErrors.name }"
              placeholder="BreizhCamp 2026"
              :disabled="submitting"
              required
            />
            <div v-if="formErrors.name" class="invalid-feedback">
              {{ formErrors.name }}
            </div>
          </div>

          <!-- Event ID field (only in create mode) -->
          <EventIdInput
            v-if="!isUpdateMode"
            v-model="eventIdValue"
            :event-name="formData.name || ''"
            :disabled="submitting"
            @validity-change="handleIdValidityChange"
          />

          <!-- Date fields -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="event-start-date" class="form-label">
                Date de début <span class="text-danger">*</span>
              </label>
              <input
                id="event-start-date"
                v-model="formData.startDate"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': formErrors.startDate }"
                :disabled="submitting"
                required
              />
              <div v-if="formErrors.startDate" class="invalid-feedback">
                {{ formErrors.startDate }}
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="event-end-date" class="form-label">
                Date de fin <span class="text-danger">*</span>
              </label>
              <input
                id="event-end-date"
                v-model="formData.endDate"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': formErrors.endDate }"
                :disabled="submitting"
                required
              />
              <div v-if="formErrors.endDate" class="invalid-feedback">
                {{ formErrors.endDate }}
              </div>
            </div>
          </div>

          <!-- Website field -->
          <div class="mb-3">
            <label for="event-website" class="form-label">Site web</label>
            <input
              id="event-website"
              v-model="formData.website"
              type="url"
              class="form-control"
              :class="{ 'is-invalid': formErrors.website }"
              placeholder="https://www.breizhcamp.org"
              :disabled="submitting"
            />
            <div v-if="formErrors.website" class="invalid-feedback">
              {{ formErrors.website }}
            </div>
          </div>

          <!-- Venue field -->
          <div class="mb-4">
            <label for="event-venue" class="form-label">Lieu</label>
            <input
              id="event-venue"
              v-model="formData.venue"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': formErrors.venue }"
              placeholder="Rennes, France"
              :disabled="submitting"
            />
            <div v-if="formErrors.venue" class="invalid-feedback">
              {{ formErrors.venue }}
            </div>
          </div>

          <!-- Form actions -->
          <div class="d-flex gap-2 justify-content-end">
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="submitting"
              @click="handleCancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isUpdateMode ? 'Mettre à jour' : 'Créer l\'événement' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  font-weight: 500;
}

.text-danger {
  color: #dc3545;
}

.card-body {
  padding: 1.5rem;
}

/* Improve form spacing on smaller screens */
@media (max-width: 767px) {
  .row > .col-md-6 {
    margin-bottom: 1rem;
  }
}
</style>
