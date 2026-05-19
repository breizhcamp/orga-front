import { queryOptions, useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

import type { EventId } from '@/dto/kalon/Event';
import type { LevelList } from '@/dto/moneiz/LevelList';
import { useMoneiz } from '@/utils/useAxios';

export function getListLevelsOptions(moneiz: ReturnType<typeof useMoneiz>, eventId?: EventId, staleTime = 60_000) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'levels'],
    queryFn: async (): Promise<LevelList[]> => {
      if (!eventId) return [];
      return (await moneiz.get<LevelList[]>(`/api/admin/${eventId}/levels`)).data;
    },
    enabled: !!eventId,
    staleTime,
    placeholderData: [],
  });
}

export function listLevels(eventId?: EventId, staleTime = 60_000): UseQueryReturnType<LevelList[], Error> {
  const moneiz = useMoneiz();
  return useQuery(getListLevelsOptions(moneiz, eventId, staleTime));
}
