import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';

import type { Event, EventId } from '@/dto/kalon/Event';
import type { SetDefaultEventAPI } from '@/dto/kalon/SetDefaultEventAPI';
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

export const useUpdateDefaultEventMutation = () => {
  const kalon = useKalon();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (defaultEventId: EventId) => {
      const payload: SetDefaultEventAPI = { defaultEventId };
      await kalon.put(`/config/default-event`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: useDefaultEventOptions(kalon).queryKey,
      });
    },
  });
};
