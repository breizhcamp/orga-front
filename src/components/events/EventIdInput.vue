<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useKalon } from '@/utils/useAxios'

const props = defineProps<{
  eventName: string
  disabled?: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validity-change': [isValid: boolean]
}>()

const kalon = useKalon()

// Local state
const localValue = ref(props.modelValue)
const isChecking = ref(false)
const isAvailable = ref<boolean | null>(null)
const formatError = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Format validation regex: lowercase alphanumeric and dash only
const ID_FORMAT_REGEX = /^[a-z0-9-]+$/

// Computed validity
const isValid = computed(() => {
  if (!localValue.value) return false
  if (formatError.value) return false
  if (isAvailable.value === false) return false
  if (isAvailable.value === null && localValue.value) return false
  return isAvailable.value === true
})

// Watch local value changes
watch(localValue, (newValue) => {
  emit('update:modelValue', newValue)

  // Reset states
  isAvailable.value = null
  formatError.value = false

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  // Validate format
  if (newValue && !ID_FORMAT_REGEX.test(newValue)) {
    formatError.value = true
    emit('validity-change', false)
    return
  }

  // Check availability with debounce
  if (newValue) {
    isChecking.value = true
    debounceTimer = setTimeout(async () => {
      await checkAvailability(newValue)
    }, 300)
  } else {
    isChecking.value = false
    emit('validity-change', false)
  }
})

// Watch validity changes
watch(isValid, (valid) => {
  emit('validity-change', valid)
})

// Watch props.modelValue for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== localValue.value) {
    localValue.value = newValue
  }
})

// Auto-generate ID from event name
function handleFocus() {
  if (!localValue.value && props.eventName) {
    const generated = props.eventName
      .toLowerCase()
      .replace(/\s+/g, '-')
    localValue.value = generated
  }
}

// Check ID availability on backend
async function checkAvailability(id: string) {
  try {
    isChecking.value = true
    await kalon.head(`/events/${id}`)
    // If we get here (200 response), the event exists
    isAvailable.value = false
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 404) {
      // 404 means the ID is available
      isAvailable.value = true
    } else {
      // Other errors - treat as unavailable to be safe
      console.error('Error checking event ID availability:', error)
      isAvailable.value = false
    }
  } finally {
    isChecking.value = false
  }
}
</script>

<template>
  <div class="mb-3">
    <label for="event-id" class="form-label">
      Identifiant de l'événement <span class="text-danger">*</span>
    </label>
    <div class="input-group">
      <input
        id="event-id"
        v-model="localValue"
        type="text"
        class="form-control"
        :class="{
          'border-danger': formatError || isAvailable === false,
          'border-success': isAvailable === true
        }"
        placeholder="breizhcamp-2026"
        :disabled="disabled"
        required
        @focus="handleFocus"
      />
      <span
        class="input-group-text bg-white border-start-0"
        :class="{
          'border-danger': formatError || isAvailable === false,
          'border-success': isAvailable === true
        }"
      >
        <!-- Checking spinner -->
        <span
          v-if="isChecking"
          class="spinner-border spinner-border-sm text-secondary"
          role="status"
          aria-hidden="true"
        ></span>
        <!-- Available checkmark -->
        <svg
          v-else-if="isAvailable === true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z"
            fill="#198754"
          />
        </svg>
        <!-- Unavailable cross -->
        <svg
          v-else-if="isAvailable === false"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z"
            fill="#dc3545"
          />
        </svg>
      </span>
    </div>
    <div v-if="formatError" class="invalid-feedback d-block">
      Format invalide (minuscules, chiffres et tirets uniquement)
    </div>
    <div v-else-if="isAvailable === false" class="invalid-feedback d-block">
      Cet identifiant est déjà utilisé
    </div>
    <div v-else class="form-text">
      L'identifiant sera généré automatiquement à partir du nom
    </div>
  </div>
</template>

<style scoped>
.input-group-text {
  min-width: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-control.border-success:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

.form-control.border-danger:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
</style>
