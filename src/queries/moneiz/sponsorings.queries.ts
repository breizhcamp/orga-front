import { queryOptions, useMutation, useQuery, useQueryClient, type UseQueryReturnType } from '@tanstack/vue-query';
import { type MaybeRef, toValue } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import type { CreateSponsoringsReq } from '@/dto/moneiz/CreateSponroringsReq';
import type { SponsoringId, SponsoringList } from '@/dto/moneiz/SponsoringList';
import type { SponsorId } from '@/dto/moneiz/SponsorList';
import { useMoneiz } from '@/utils/useAxios';

export function getListSponsoringsOptions(
  moneiz: ReturnType<typeof useMoneiz>,
  eventId: MaybeRef<EventId | undefined>,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings'],
    queryFn: async (): Promise<SponsoringList[]> => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) return [];
      const response = await moneiz.get<SponsoringList[]>(
        `/api/admin/${currentEventId}/sponsorings`,
      );
      return response.data;
    },
    enabled: !!eventId,
    staleTime,
  });
}

export function listSponsorings(
  eventId: MaybeRef<EventId | undefined>,
  staleTime = 60_000,
): UseQueryReturnType<SponsoringList[], Error> {
  const moneiz = useMoneiz();
  return useQuery(getListSponsoringsOptions(moneiz, eventId, staleTime));
}

export function useCreateSponsoringsMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, createSponsoringsReq }: {
      eventId: EventId;
      createSponsoringsReq: CreateSponsoringsReq;
    }) => {
      const response = await moneiz.post<SponsoringList[]>(
        `/api/admin/${eventId}/sponsorings`,
        createSponsoringsReq,
      );
      return response.data;
    },
    onSuccess: (data, { eventId }) => {
      queryClient.setQueryData(
        getListSponsoringsOptions(moneiz, eventId).queryKey,
        data,
      );
    },
  });
}

export function useSetSponsorMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
      sponsorId,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
      sponsorId: SponsorId;
    }) => {
      await moneiz.post(
        `/api/admin/${eventId}/sponsorings/${sponsoringId}/sponsor`,
        { sponsor: sponsorId },
      );
    },
    onSuccess: async (_data, { eventId }) => {
      const { queryKey } = getListSponsoringsOptions(moneiz, eventId);
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}
