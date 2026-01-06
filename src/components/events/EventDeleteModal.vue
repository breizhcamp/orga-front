<script setup lang="ts">
import ModalForm from '@/components/modals/ModalForm.vue'
import { useKalon } from '@/utils/useAxios'
import { ref, computed } from 'vue'
import BiTrash from 'bootstrap-icons/icons/trash.svg?component'
import BiExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component'
import BiXCircleFill from 'bootstrap-icons/icons/x-circle-fill.svg?component'

const props = defineProps<{
  eventId: string
  eventName?: string
}>()

const emit = defineEmits<{
  deleted: []
}>()

const kalon = useKalon()

// Modal state
const showDeleteModal = ref(false)
const deleteConfirmationId = ref('')
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

// Validation
const isConfirmationValid = computed(() => {
  return deleteConfirmationId.value.trim() === props.eventId
})

// Open modal
function openDeleteModal() {
  showDeleteModal.value = true
  deleteConfirmationId.value = ''
  deleteError.value = null
}

// Close modal
function closeDeleteModal() {
  showDeleteModal.value = false
  deleteConfirmationId.value = ''
  deleteError.value = null
}

// Handle delete
async function handleDelete() {
  if (!isConfirmationValid.value) {
    deleteError.value = "L'identifiant saisi ne correspond pas"
    return
  }

  try {
    isDeleting.value = true
    deleteError.value = null

    await kalon.delete(`/events/${props.eventId}`)

    // Close modal and emit success
    closeDeleteModal()
    emit('deleted')
  } catch (e) {
    console.error('Erreur lors de la suppression de l\'événement', e)
    const axiosError = e as { response?: { data?: { message?: string } } }
    deleteError.value = axiosError.response?.data?.message || 'Une erreur est survenue lors de la suppression'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Delete Button -->
    <button
      type="button"
      class="btn btn-outline-danger"
      @click="openDeleteModal"
      title="Supprimer l'événement"
    >
      <BiTrash class="bi" />
      Supprimer
    </button>

    <!-- Delete Confirmation Modal -->
    <ModalForm
      v-model:open="showDeleteModal"
      :loading="isDeleting"
      title="Supprimer l'événement"
      save-button-text="Supprimer"
      save-button-variant="danger"
      @save="handleDelete"
    >
      <div class="alert alert-warning d-flex align-items-start" role="alert">
        <BiExclamationTriangleFill class="bi flex-shrink-0 me-2 mt-1" />
        <div>
          <strong>Attention !</strong> Cette action est irréversible.
        </div>
      </div>

      <p class="mb-3">
        Vous êtes sur le point de supprimer l'événement
        <strong>{{ eventName || eventId }}</strong>.
      </p>

      <p class="mb-3">
        Pour confirmer, veuillez saisir l'identifiant de l'événement :
        <code class="bg-light px-2 py-1 rounded">{{ eventId }}</code>
      </p>

      <div class="mb-3">
        <label for="delete-confirmation-id" class="form-label">
          Identifiant de l'événement
        </label>
        <input
          id="delete-confirmation-id"
          v-model="deleteConfirmationId"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': deleteError || (deleteConfirmationId && !isConfirmationValid) }"
          placeholder="Saisissez l'identifiant"
          :disabled="isDeleting"
          autocomplete="off"
        />
        <div v-if="deleteConfirmationId && !isConfirmationValid" class="invalid-feedback">
          L'identifiant ne correspond pas
        </div>
      </div>

      <!-- Error message -->
      <div v-if="deleteError" class="alert alert-danger d-flex align-items-center" role="alert">
        <BiXCircleFill class="bi flex-shrink-0 me-2" />
        <div>{{ deleteError }}</div>
      </div>
    </ModalForm>
  </div>
</template>

<style scoped>
.bi {
  width: 1em;
  height: 1em;
  margin-right: 0.25rem;
}
</style>
