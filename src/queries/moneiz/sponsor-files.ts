import type { ReadFile } from '@/dto/moneiz/ReadFile.ts';
import { useMoneiz } from '@/utils/useAxios.ts';
import type { AxiosInstance } from 'axios';
import { onUnmounted, ref, type Ref, watch } from 'vue';

async function retrieveFileBlob(client: AxiosInstance, file: ReadFile) {
  const res = await client.get<Blob>(`/api/admin/sponsors/${file.sponsorId}/file/${file.fileId}`, {
    responseType: 'blob'
  });
  return URL.createObjectURL(res.data)
}

export function useSponsorFiles(files: Ref<ReadFile[] | undefined>) {
  const filesUrls = ref<Map<string, string>>(new Map());
  const isLoading = ref(false);
  const errors = ref<Map<string, string>>(new Map());
  const moneiz = useMoneiz()

  // Clean up blob URLs when component unmounts
  onUnmounted(() => {
    filesUrls.value.forEach(url => URL.revokeObjectURL(url));
    filesUrls.value.clear();
  });

  // Fetch file as blob and create object URL
  async function fetchFile(file: ReadFile) {
    try {
      const blobUrl = await retrieveFileBlob(moneiz, file)
      filesUrls.value.set(file.sponsorId, blobUrl);
    } catch (error) {
      console.error(`Failed to load file for sponsor ${file.sponsorId}:`, error);
      errors.value.set(file.sponsorId, error instanceof Error ? error.message : 'Failed to load file');
    }
  }

  // Load files when sponsors data changes
  watch(files, async (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;

    // Clean up old blob URLs
    filesUrls.value.forEach(url => URL.revokeObjectURL(url));
    filesUrls.value.clear();
    errors.value.clear();

    isLoading.value = true;

    // Fetch all files in parallel
    const fetchPromises = newFiles.map(file => fetchFile(file));

    await Promise.allSettled(fetchPromises);
    isLoading.value = false;
  }, { immediate: true });

  return {
    filesUrls,
    isLoading,
    errors
  };
}

export function useSponsorFile(file: Ref<ReadFile | undefined>) {
  const fileUrl = ref<string | undefined>();
  const isLoading = ref(false);
  const error = ref<string | undefined>();
  const moneiz = useMoneiz()

  // Clean up blob URL when component unmounts
  onUnmounted(() => {
    if (fileUrl.value) {
      URL.revokeObjectURL(fileUrl.value);
      fileUrl.value = undefined;
    }
  });

  // Fetch file as blob and create object URL
  async function fetchFile(file: ReadFile) {
    try {
      fileUrl.value = await retrieveFileBlob(moneiz, file)
    } catch (err) {
      console.error(`Failed to load file for sponsor ${file.sponsorId}:`, err);
      error.value = err instanceof Error ? err.message : 'Failed to load file';
    }
  }

  // Load file when input changes
  watch(file, async (newFile) => {
    // Clean up old blob URL
    if (fileUrl.value) {
      URL.revokeObjectURL(fileUrl.value);
      fileUrl.value = undefined;
    }
    error.value = undefined;

    if (!newFile) return;

    isLoading.value = true;
    await fetchFile(newFile);
    isLoading.value = false;
  }, { immediate: true });

  return {
    fileUrl,
    isLoading,
    error
  };
}
