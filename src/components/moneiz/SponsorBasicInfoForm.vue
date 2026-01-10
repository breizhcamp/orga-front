<script setup lang="ts">
import type { Sponsor } from '@/dto/moneiz/Sponsor'
import type { SponsorId } from '@/dto/moneiz/SponsorList.ts'
import { useSponsorFile } from '@/queries/moneiz/sponsor-files.ts'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: Sponsor | undefined,
  sponsorId: SponsorId | undefined,
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Sponsor]
  'update:logoFile': [file: File | null]
}>()

const localSponsor = computed({
  get: () => props.modelValue ?? {
    name: '',
    token: '',
    url: '',
    logo: undefined
  },
  set: (value) => emit('update:modelValue', value)
})

watch(localSponsor, (newValue) => {
  console.log('modelValue changed:', newValue.logo)
}, { immediate: true })

// Validation errors
const nameError = ref<string>('')
const tokenError = ref<string>('')
const urlError = ref<string>('')

// Logo preview
const logoPreview = ref<string>('')
const logoFile = ref<File | null>(null)

const logoRead = computed(() => {
  if (props.sponsorId && localSponsor.value.logo) {
    return { sponsorId: props.sponsorId, fileId: localSponsor.value.logo }
  }
  return undefined
})

const { fileUrl: logoUrl } = useSponsorFile(logoRead)

// Validation functions
const validateName = () => {
  if (!localSponsor.value.name || localSponsor.value.name.trim() === '') {
    nameError.value = 'Le nom est requis'
    return false
  }
  nameError.value = ''
  return true
}

const validateToken = () => {
  if (!localSponsor.value.token || localSponsor.value.token.trim() === '') {
    tokenError.value = 'Le token est requis'
    return false
  }
  tokenError.value = ''
  return true
}

const validateUrl = () => {
  if (localSponsor.value.url && localSponsor.value.url.trim() !== '') {
    try {
      new URL(localSponsor.value.url)
      urlError.value = ''
      return true
    } catch {
      urlError.value = 'URL invalide'
      return false
    }
  }
  urlError.value = ''
  return true
}

// UUID generation
const generateUUID = () => {
  localSponsor.value.token = crypto.randomUUID().replace(/-/g, '')
  validateToken()
}

// Logo handling
const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    logoFile.value = file
    emit('update:logoFile', file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    logoFile.value = null
    logoPreview.value = ''
    emit('update:logoFile', null)
  }
}

// Expose validation function
defineExpose({
  validate: () => {
    const nameValid = validateName()
    const tokenValid = validateToken()
    const urlValid = validateUrl()
    return nameValid && tokenValid && urlValid
  }
})
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h5 class="card-title mb-3">Informations de base</h5>

      <form @submit.prevent>
        <!-- Name field -->
        <div class="row mb-3">
          <label for="sponsor-name" class="col-sm-3 col-form-label">
            Nom <span class="text-danger">*</span>
          </label>
          <div class="col-sm-9">
            <input
              id="sponsor-name"
              v-model="localSponsor.name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': nameError }"
              placeholder="Nom du sponsor"
              @blur="validateName"
              @input="validateName"
            />
            <div v-if="nameError" class="invalid-feedback">
              {{ nameError }}
            </div>
          </div>
        </div>

        <!-- Token field with UUID generator -->
        <div class="row mb-3">
          <label for="sponsor-token" class="col-sm-3 col-form-label">
            Token <span class="text-danger">*</span>
          </label>
          <div class="col-sm-9">
            <div class="input-group">
              <input
                id="sponsor-token"
                v-model="localSponsor.token"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': tokenError }"
                placeholder="Token unique"
                @blur="validateToken"
                @input="validateToken"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="generateUUID"
                title="Générer un UUID"
              >
                🔑
              </button>
              <div v-if="tokenError" class="invalid-feedback">
                {{ tokenError }}
              </div>
            </div>
          </div>
        </div>

        <!-- URL field -->
        <div class="row mb-3">
          <label for="sponsor-url" class="col-sm-3 col-form-label">URL</label>
          <div class="col-sm-9">
            <input
              id="sponsor-url"
              v-model="localSponsor.url"
              type="url"
              class="form-control"
              :class="{ 'is-invalid': urlError }"
              placeholder="https://example.com"
              @blur="validateUrl"
              @input="validateUrl"
            />
            <div v-if="urlError" class="invalid-feedback">
              {{ urlError }}
            </div>
          </div>
        </div>

        <!-- Logo field -->
        <div class="row mb-3">
          <label for="sponsor-logo" class="col-sm-3 col-form-label">Logo</label>
          <div class="col-sm-9">
            <!-- Logo preview -->
            <div v-if="logoPreview || logoUrl" class="mb-2">
              <img
                :src="logoPreview || logoUrl"
                alt="Logo preview"
                class="img-thumbnail logo-preview"
              />
            </div>

            <!-- File input -->
            <input
              id="sponsor-logo"
              type="file"
              class="form-control"
              accept="image/*"
              @change="handleLogoChange"
            />
            <div class="form-text">
              JPG, PNG, SVG, etc.
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card-title {
  font-weight: 600;
}

.logo-preview {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.text-danger {
  color: #dc3545;
}

.form-label {
  font-weight: 500;
}
</style>
