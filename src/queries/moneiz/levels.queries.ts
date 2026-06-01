import { queryOptions, useQuery, type UseQueryReturnType } from '@tanstack/vue-query';
import { computed, type MaybeRef, toValue } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import type { LevelList } from '@/dto/moneiz/LevelList';
import { useMoneiz } from '@/utils/useAxios';

export function getListLevelsOptions(
  moneiz: ReturnType<typeof useMoneiz>,
  eventId: MaybeRef<EventId | undefined>,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'levels'],
    queryFn: async (): Promise<LevelList[]> => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) return [];
      const response = await moneiz.get<LevelList[]>(
        `/api/admin/${currentEventId}/levels`,
      );
      return response.data;
    },
    enabled: computed(() => !!toValue(eventId)),
    staleTime,
  });
}

export function listLevels(
  eventId: MaybeRef<EventId | undefined>,
  staleTime = 60_000,
): UseQueryReturnType<LevelList[], Error> {
  const moneiz = useMoneiz();
  return useQuery(getListLevelsOptions(moneiz, eventId, staleTime));
}
