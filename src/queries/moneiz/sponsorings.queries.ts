import { queryOptions, useMutation, useQuery, useQueryClient, type UseQueryReturnType } from '@tanstack/vue-query';
import { type MaybeRef, toValue } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import type { CreateSponsoringsReq } from '@/dto/moneiz/CreateSponroringsReq';
import type { SponsoringId, SponsoringList } from '@/dto/moneiz/SponsoringList';
import type { SponsoringRes } from '@/dto/moneiz/SponsoringRes';
import type { SponsorId } from '@/dto/moneiz/SponsorList';
import { useMoneiz } from '@/utils/useAxios';

type Moneiz = ReturnType<typeof useMoneiz>;

export function getListSponsoringsOptions(
  moneiz: Moneiz,
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
    enabled: !!toValue(eventId),
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

export function getSponsoringOptions(
  moneiz: Moneiz,
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings', sponsoringId],
    queryFn: async () => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) {
        throw new Error('');
      }
      const response = await moneiz.get<SponsoringRes>(
        `/api/admin/${currentEventId}/sponsorings/${sponsoringId}`,
      );
      return response.data;
    },
    enabled: !!toValue(eventId),
    staleTime,
  });
}

export function getSponsoring(
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  const moneiz = useMoneiz();
  return useQuery(getSponsoringOptions(moneiz, eventId, sponsoringId, staleTime));
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
    onSuccess: async (_data, { eventId, sponsoringId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getListSponsoringsOptions(moneiz, eventId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getSponsoringOptions(moneiz, eventId, sponsoringId).queryKey,
        }),
      ]);
    },
  });
}
