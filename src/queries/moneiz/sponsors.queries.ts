import type { Sponsor } from '@/dto/moneiz/Sponsor.ts';
import type { SponsorList } from '@/dto/moneiz/SponsorList.ts';
import type { FileCreateApi } from '@/dto/moneiz/FileCreateApi.ts';
import { useMoneiz } from '@/utils/useAxios.ts';
import { useQuery, useMutation, useQueryClient, type UseQueryReturnType } from '@tanstack/vue-query';

function listSponsors(staleTime: number = 60_000): UseQueryReturnType<SponsorList[], Error> {
  const moneiz = useMoneiz()
  return useQuery({
    queryKey: ['moneiz', 'sponsors'],
    queryFn: async (): Promise<SponsorList[]> => {
      return (await moneiz.get<SponsorList[]>('/api/admin/sponsors')).data
    },
    staleTime,
  })
}

function getSponsor(id: string, forEditing: boolean = false, staleTime: number = 60_000): UseQueryReturnType<Sponsor, Error> {
  const moneiz = useMoneiz()
  return useQuery({
    queryKey: ['moneiz', 'sponsors', id],
    queryFn: async (): Promise<Sponsor> => {
      return (await moneiz.get<Sponsor>(`/api/admin/sponsors/${id}`)).data
    },
    staleTime,
    refetchOnWindowFocus: !forEditing,
  })
}

function useCreateSponsorMutation() {
  const moneiz = useMoneiz()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sponsor: Sponsor) => {
      const response = await moneiz.post<{ id: string }>('/api/admin/sponsors', sponsor)
      return response.data
    },
    onSuccess: () => {
      // Invalidate the sponsors list to refetch it
      queryClient.invalidateQueries({ queryKey: ['moneiz', 'sponsors'] })
    },
  })
}

function useUpdateSponsorMutation() {
  const moneiz = useMoneiz()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, sponsor }: { id: string; sponsor: Sponsor }) => {
      const response = await moneiz.put(`/api/admin/sponsors/${id}`, sponsor)
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the list and the specific sponsor query
      queryClient.invalidateQueries({ queryKey: ['moneiz', 'sponsors'] })
      queryClient.invalidateQueries({ queryKey: ['moneiz', 'sponsors', variables.id] })
    },
  })
}

function useUploadSponsorLogoMutation() {
  const moneiz = useMoneiz()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sponsorId, file }: { sponsorId: string; file: File }) => {
      const formData = new FormData()
      formData.append('logo', file)
      const response = await moneiz.post<FileCreateApi>(
        `/api/admin/sponsors/${sponsorId}/logo`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate the specific sponsor query to refetch with new logo
      queryClient.invalidateQueries({ queryKey: ['moneiz', 'sponsors', variables.sponsorId] })
      queryClient.invalidateQueries({ queryKey: ['moneiz', 'sponsors'] })
    },
  })
}

export { listSponsors, getSponsor, useCreateSponsorMutation, useUpdateSponsorMutation, useUploadSponsorLogoMutation }
