<script setup lang="ts">
import { newSponsor, type Sponsor } from '@/dto/moneiz/Sponsor'
import type { SponsorId } from '@/dto/moneiz/SponsorList.ts'
import { useSponsorFile } from '@/queries/moneiz/sponsor-files.ts'
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  modelValue: Sponsor | undefined,
  sponsorId: SponsorId | undefined,
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Sponsor]
  'update:logoFile': [file: File | null]
}>()

const localSponsor = computed({
  get: () => props.modelValue ?? newSponsor(),
  set: (value) => emit('update:modelValue', value)
})

// Validation errors
const nameError = ref<string>('')
const tokenError = ref<string>('')
const urlError = ref<string>('')

// Logo preview
const logoPreview = ref<string>('')
const logoFile = ref<File | null>(null)

// Existing logo loading
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
const generateUUID = async () => {
  localSponsor.value = { ...localSponsor.value, token: crypto.randomUUID().replace(/-/g, '') }
  await nextTick()
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
            <input id="sponsor-name" type="text" class="form-control" v-model="localSponsor.name"
              placeholder="Nom du sponsor" :class="{ 'is-invalid': nameError }" :disabled="disabled"
              @blur="validateName" @input="validateName"
            />
            <div v-if="nameError" class="invalid-feedback">{{ nameError }}</div>
          </div>
        </div>

        <!-- Token field with UUID generator -->
        <div class="row mb-3">
          <label for="sponsor-token" class="col-sm-3 col-form-label">
            Token <span class="text-danger">*</span>
          </label>
          <div class="col-sm-9">
            <div class="input-group">
              <input id="sponsor-token" type="text" class="form-control" v-model="localSponsor.token"
                placeholder="Token unique" :class="{ 'is-invalid': tokenError }" :disabled="disabled"
                @blur="validateToken" @input="validateToken"
              />
              <button type="button" class="btn btn-outline-secondary" title="Générer un UUID" @click="generateUUID">
                🔑
              </button>
              <div v-if="tokenError" class="invalid-feedback">{{ tokenError }}</div>
            </div>
          </div>
        </div>

        <!-- URL field -->
        <div class="row mb-3">
          <label for="sponsor-url" class="col-sm-3 col-form-label">URL</label>
          <div class="col-sm-9">
            <input id="sponsor-url" type="url" class="form-control" v-model="localSponsor.url"
              placeholder="https://example.com" :class="{ 'is-invalid': urlError }" :disabled="disabled"
              @blur="validateUrl" @input="validateUrl"
            />
            <div v-if="urlError" class="invalid-feedback">{{ urlError }}</div>
          </div>
        </div>

        <!-- Logo field -->
        <div class="row mb-3">
          <label for="sponsor-logo" class="col-sm-3 col-form-label">Logo</label>
          <div class="col-sm-9">
            <!-- Logo preview -->
            <div v-if="logoPreview || logoUrl" class="mb-2">
              <img :src="logoPreview || logoUrl" alt="Logo preview" class="img-thumbnail logo-preview"/>
            </div>

            <!-- File input -->
            <input id="sponsor-logo" type="file" class="form-control"
              accept="image/*" @change="handleLogoChange" :disabled="disabled"
            />
            <div class="form-text">JPG, PNG, SVG</div>
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
</style>
