import type { SponsorList } from '@/dto/moneiz/SponsorList.ts';
import { useMoneiz } from '@/utils/useAxios.ts';
import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

function listSponsors(staleTime: number = 60): UseQueryReturnType<SponsorList[], Error> {
  return useQuery({
    queryKey: ['moneiz', 'sponsors'],
    queryFn: async (): Promise<SponsorList[]> => {
      return (await useMoneiz().get<SponsorList[]>('/api/admin/sponsors')).data
    },
    staleTime,
  })
}

export { listSponsors }
