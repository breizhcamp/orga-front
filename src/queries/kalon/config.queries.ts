import { queryOptions, useQuery } from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';

import type { Event } from '@/dto/kalon/Event';
import { useKalon } from '@/utils/useAxios';

export const useDefaultEventOptions = (kalon: AxiosInstance) => queryOptions({
  queryKey: ['kalon', 'config', 'default-event'],
  queryFn: async () => {
    const reponse = await kalon.get<Event>(`/config/default-event`);
    return reponse.data;
  },
});

export const useDefaultEvent = () => {
  const kalon = useKalon();
  return useQuery(useDefaultEventOptions(kalon));
};
