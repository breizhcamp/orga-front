import type { Sponsor } from '@/dto/moneiz/Sponsor.ts';
import type { SponsorList } from '@/dto/moneiz/SponsorList.ts';
import { useMoneiz } from '@/utils/useAxios.ts';
import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

function listSponsors(staleTime: number = 60): UseQueryReturnType<SponsorList[], Error> {
  const moneiz = useMoneiz()
  return useQuery({
    queryKey: ['moneiz', 'sponsors'],
    queryFn: async (): Promise<SponsorList[]> => {
      return (await moneiz.get<SponsorList[]>('/api/admin/sponsors')).data
    },
    staleTime,
  })
}

function getSponsor(id: string, staleTime: number = 60): UseQueryReturnType<Sponsor, Error> {
  const moneiz = useMoneiz()
  return useQuery({
    queryKey: ['moneiz', 'sponsors', id],
    queryFn: async (): Promise<Sponsor> => {
      return (await moneiz.get<Sponsor>(`/api/admin/sponsors/${id}`)).data
    },
    staleTime,
  })
}

export { listSponsors, getSponsor }
