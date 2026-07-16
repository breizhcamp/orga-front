import { queryOptions, useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

import type { LevelList } from '@/dto/moneiz/LevelList';
import { useMoneiz } from '@/utils/useAxios';

export function getListLevelsOptions(
  moneiz: ReturnType<typeof useMoneiz>,
  staleTime = 60_000,
) {
  return queryOptions({
    queryKey: ['moneiz', 'levels'],
    queryFn: async (): Promise<LevelList[]> => {
      const response = await moneiz.get<LevelList[]>('/api/public/levels');
      return response.data;
    },
    staleTime,
  });
}

export function listLevels(
  staleTime = 60_000,
): UseQueryReturnType<LevelList[], Error> {
  const moneiz = useMoneiz();
  return useQuery(getListLevelsOptions(moneiz, staleTime));
}
