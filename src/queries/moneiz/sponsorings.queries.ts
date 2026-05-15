import type { EventId } from '@/dto/kalon/Event';
import type { SponsoringList } from '@/dto/moneiz/SponsoringList';
import { useMoneiz } from '@/utils/useAxios';
import { queryOptions, useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

export function getListSponsoringsOptions(eventId?: EventId, staleTime = 60_000) {
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings'],
    queryFn: async (): Promise<SponsoringList[]> => {
      if (!eventId) return [];
      return (await useMoneiz().get<SponsoringList[]>(`/api/admin/${eventId}/sponsorings`)).data;
    },
    enabled: !!eventId,
    staleTime,
    placeholderData: [],
  });
}

export function listSponsorings(eventId?: EventId, staleTime = 60_000): UseQueryReturnType<SponsoringList[], Error> {
  return useQuery(getListSponsoringsOptions(eventId, staleTime));
}
