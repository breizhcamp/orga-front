import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import { type MaybeRef, toValue } from 'vue';

import type { Event, EventId, EventSummary } from '@/dto/kalon/Event';
import { useDefaultEventOptions } from '@/queries/kalon/config.queries';
import { useKalon } from '@/utils/useAxios';

const useEventOptions = (
  kalon: AxiosInstance,
  eventId: MaybeRef<EventId | undefined>,
) => queryOptions({
  queryKey: ['kalon', 'events', eventId],
  queryFn: async () => {
    const eventIdValue = toValue(eventId)!;
    const { data } = await kalon.get<Event>(`/events/${eventIdValue}`);
    return data;
  },
  enabled: () => toValue(eventId) !== undefined,
});

export const useEvent = (eventId: MaybeRef<EventId | undefined>) => {
  const kalon = useKalon();
  return useQuery(useEventOptions(kalon, eventId));
};

export const useEventExistsOptions = (
  kalon: AxiosInstance,
  eventId: MaybeRef<EventId>,
) => queryOptions({
  queryKey: ['kalon', 'events', eventId],
  queryFn: async () => {
    const eventIdValue = toValue(eventId);
    try {
      await kalon.head<Event>(`/events/${eventIdValue}`);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return true;
      }
      throw error;
    }
    return false;
  },
});

export const useEventExists = (eventId: MaybeRef<EventId>) => {
  const kalon = useKalon();
  return useQuery(useEventExistsOptions(kalon, eventId));
};

const useEventsOptions = (kalon: AxiosInstance) => queryOptions({
  queryKey: ['kalon', 'events', 'full'],
  queryFn: async () => {
    const { data } = await kalon.get<Event[]>('/events?view=full');
    return data;
  },
});

export const useEvents = () => {
  const kalon = useKalon();
  return useQuery(useEventsOptions(kalon));
};

const useEventSummariesOptions = (kalon: AxiosInstance) => queryOptions({
  queryKey: ['kalon', 'events', 'summary'],
  queryFn: async () => {
    const { data } = await kalon.get<EventSummary[]>('/events?view=summary');
    return data;
  },
});

export const useEventSummaries = () => {
  const kalon = useKalon();
  return useQuery(useEventSummariesOptions(kalon));
};

export const useCreateEventMutation = () => {
  const kalon = useKalon();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Event) => {
      await kalon.post('/events', event);
    },
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: useEventExistsOptions(kalon, id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventsOptions(kalon).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventSummariesOptions(kalon).queryKey,
        }),
      ]);
    },
  });
};

export const useUpdateEventMutation = () => {
  const kalon = useKalon();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Event) => {
      await kalon.put(`/events/${event.id}`, event);
    },
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: useEventOptions(kalon, id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventsOptions(kalon).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventSummariesOptions(kalon).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useDefaultEventOptions(kalon).queryKey,
        }),
      ]);
    },
  });
};

export const useDeleteEventMutation = () => {
  const kalon = useKalon();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: EventId) => {
      await kalon.delete(`/events/${eventId}`);
    },
    onSuccess: async (_data, eventId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: useEventOptions(kalon, eventId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventExistsOptions(kalon, eventId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventsOptions(kalon).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useEventSummariesOptions(kalon).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useDefaultEventOptions(kalon).queryKey,
        }),
      ]);
    },
  });
};
