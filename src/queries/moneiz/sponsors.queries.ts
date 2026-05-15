import { queryOptions, useMutation, useQuery, useQueryClient, type UseQueryReturnType } from '@tanstack/vue-query';

import type { FileCreateApi } from '@/dto/moneiz/FileCreateApi.ts';
import type { Sponsor } from '@/dto/moneiz/Sponsor.ts';
import type { SponsorList } from '@/dto/moneiz/SponsorList.ts';
import { useMoneiz } from '@/utils/useAxios.ts';

type Moneiz = ReturnType<typeof useMoneiz>;

function getListSponsorsOptions(moneiz: Moneiz, staleTime = 60_000) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', 'sponsors'],
    queryFn: async (): Promise<SponsorList[]> => {
      return (await moneiz.get<SponsorList[]>('/api/admin/sponsors')).data;
    },
    staleTime,
  });
}

function listSponsors(staleTime = 60_000): UseQueryReturnType<SponsorList[], Error> {
  const moneiz = useMoneiz();
  return useQuery(getListSponsorsOptions(moneiz, staleTime));
}

function getSponsorOptions(moneiz: Moneiz, id: string, forEditing = false, staleTime = 60_000) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', 'sponsors', id],
    queryFn: async (): Promise<Sponsor> => {
      return (await moneiz.get<Sponsor>(`/api/admin/sponsors/${id}`)).data;
    },
    staleTime,
    refetchOnWindowFocus: !forEditing,
  });
}

function getSponsor(id: string, forEditing = false, staleTime = 60_000): UseQueryReturnType<Sponsor, Error> {
  const moneiz = useMoneiz();
  return useQuery(getSponsorOptions(moneiz, id, forEditing, staleTime));
}

function useCreateSponsorMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sponsor: Sponsor) => {
      const response = await moneiz.post<{ id: string }>('/api/admin/sponsors', sponsor);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate the sponsors list to refetch it
      await queryClient.invalidateQueries({ queryKey: getListSponsorsOptions(moneiz).queryKey });
    },
  });
}

function useUpdateSponsorMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sponsor }: { id: string; sponsor: Sponsor }) => {
      const response = await moneiz.put(`/api/admin/sponsors/${id}`, sponsor);
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      // Invalidate both the list and the specific sponsor query
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListSponsorsOptions(moneiz).queryKey }),
        queryClient.invalidateQueries({ queryKey: getSponsorOptions(moneiz, variables.id).queryKey }),
      ]);
    },
  });
}

function useUploadSponsorLogoMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sponsorId, file }: { sponsorId: string; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await moneiz.post<FileCreateApi>(
        `/api/admin/sponsors/${sponsorId}/logo`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      // Invalidate the specific sponsor query to refetch with new logo
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListSponsorsOptions(moneiz).queryKey }),
        queryClient.invalidateQueries({ queryKey: getSponsorOptions(moneiz, variables.sponsorId).queryKey }),
      ]);
    },
  });
}

export { getSponsor, listSponsors, useCreateSponsorMutation, useUpdateSponsorMutation, useUploadSponsorLogoMutation };
