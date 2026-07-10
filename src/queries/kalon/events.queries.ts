import { queryOptions, useQuery } from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';

import type { Event } from '@/dto/kalon/Event';
import { useKalon } from '@/utils/useAxios';

// eslint-disable-next-line @tanstack/query/exhaustive-deps
const listEventsOptions = (kalon: AxiosInstance) => queryOptions({
  queryKey: ['kalon', 'events'],
  queryFn: async () => {
    const response = await kalon.get<Event[]>('/events');
    return response.data;
  },
});

export const listEvents = () => {
  const kalon = useKalon();
  return useQuery(listEventsOptions(kalon));
};
