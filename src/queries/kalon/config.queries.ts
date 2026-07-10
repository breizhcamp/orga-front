import { queryOptions, useQuery } from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';

import type { Event } from '@/dto/kalon/Event';
import { useKalon } from '@/utils/useAxios';

// eslint-disable-next-line @tanstack/query/exhaustive-deps
export const getDefaultEventOptions = (kalon: AxiosInstance) => queryOptions({
  queryKey: ['kalon', 'config', 'default-event'],
  queryFn: async () => {
    const reponse = await kalon.get<Event>(`/config/default-event`);
    return reponse.data;
  },
});

export const getDefaultEvent = () => {
  const kalon = useKalon();
  return useQuery(getDefaultEventOptions(kalon));
};
