import { queryOptions, useMutation, useQuery, useQueryClient, type UseQueryReturnType } from '@tanstack/vue-query';
import { type MaybeRef, toValue } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import type { AgreementState } from '@/dto/moneiz/AgreementState';
import type { CreateSponsoringsReq } from '@/dto/moneiz/CreateSponroringsReq';
import type { InvoiceReq } from '@/dto/moneiz/InvoiceReq';
import type { InvoiceTemplateRes } from '@/dto/moneiz/InvoiceTemplateRes';
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
        throw new Error('eventId must be defined');
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

export function getSponsoringInvoiceTemplateOption(
  moneiz: Moneiz,
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings', sponsoringId, 'invoice'],
    queryFn: async () => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) {
        throw new Error('eventId must be defined');
      }
      const response = await moneiz.get<InvoiceTemplateRes>(
        `/api/admin/${currentEventId}/sponsorings/${sponsoringId}/invoice`,
      );
      return response.data;
    },
    enabled: !!toValue(eventId),
    staleTime,
  });
}

export function getSponsoringInvoiceTemplate(
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  const moneiz = useMoneiz();
  return useQuery(getSponsoringInvoiceTemplateOption(moneiz, eventId, sponsoringId, staleTime));
}

export function getSponsoringInvoiceEmailUrlOptions(
  moneiz: Moneiz,
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings', sponsoringId, 'invoice', 'email'],
    queryFn: async () => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) {
        throw new Error('eventId must be defined');
      }
      const response = await moneiz.get<string>(
        `/api/admin/${currentEventId}/sponsorings/${sponsoringId}/invoice/email`,
      );
      return response.data;
    },
    enabled: !!toValue(eventId),
    staleTime,
  });
}

export function getSponsoringInvoiceEmailUrl(
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  const moneiz = useMoneiz();
  return useQuery(getSponsoringInvoiceEmailUrlOptions(moneiz, eventId, sponsoringId, staleTime));
}

export function getSponsoringPlaceRequestEmailUrlOptions(
  moneiz: Moneiz,
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings', sponsoringId, 'place', 'email'],
    queryFn: async () => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) {
        throw new Error('eventId must be defined');
      }
      const response = await moneiz.get<string>(
        `/api/admin/${currentEventId}/sponsorings/${sponsoringId}/place/email`,
      );
      return response.data;
    },
    enabled: !!toValue(eventId),
    staleTime,
  });
}

export function getSponsoringPlaceRequestEmailUrl(
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  const moneiz = useMoneiz();
  return useQuery(getSponsoringPlaceRequestEmailUrlOptions(moneiz, eventId, sponsoringId, staleTime));
}

export function getSponsoringPlaceInstallationEmailUrlOptions(
  moneiz: Moneiz,
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings', sponsoringId, 'place', 'installation-email'],
    queryFn: async () => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) {
        throw new Error('eventId must be defined');
      }
      const response = await moneiz.get<string>(
        `/api/admin/${currentEventId}/sponsorings/${sponsoringId}/place/installation-email`,
      );
      return response.data;
    },
    enabled: !!toValue(eventId),
    staleTime,
  });
}

export function getSponsoringPlaceInstallationEmailUrl(
  eventId: MaybeRef<EventId | undefined>,
  sponsoringId: SponsoringId,
  staleTime = 60_000,
) {
  const moneiz = useMoneiz();
  return useQuery(getSponsoringPlaceInstallationEmailUrlOptions(moneiz, eventId, sponsoringId, staleTime));
}

export function getAlreadyAssignedStandsOptions(
  moneiz: Moneiz,
  eventId: MaybeRef<EventId | undefined>,
  staleTime = 60_000,
) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return queryOptions({
    queryKey: ['moneiz', eventId, 'sponsorings', 'already-assigned-places'],
    queryFn: async () => {
      const currentEventId = toValue(eventId);
      if (currentEventId === undefined) {
        throw new Error('eventId must be defined');
      }
      const response = await moneiz.get<string[]>(
        `/api/admin/${currentEventId}/sponsorings/already-assigned-places`,
      );
      return response.data;
    },
    enabled: !!toValue(eventId),
    staleTime,
  });
}

export function getAlreadyAssignedStands(
  eventId: MaybeRef<EventId | undefined>,
  staleTime = 60_000,
) {
  const moneiz = useMoneiz();
  return useQuery(getAlreadyAssignedStandsOptions(moneiz, eventId, staleTime));
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

export function useManualUpdateAgreementMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
      presale,
      file,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
      presale: number;
      file?: File;
    }) => {
      const formData = new FormData();
      formData.append('presale', presale.toString());
      if (file) formData.append('file', file);
      await moneiz.post(
        `/api/admin/${eventId}/sponsorings/${sponsoringId}/agreement`,
        formData,
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

export function useSetAgreementStateMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
      agreementState,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
      agreementState: AgreementState;
    }) => {
      await moneiz.post(
        `/api/admin/${eventId}/sponsorings/${sponsoringId}/agreement-state`,
        { agreementState: agreementState },
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

export function useCreateOnlineAgreementMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
    }) => {
      await moneiz.post(
        `/api/admin/${eventId}/sponsorings/${sponsoringId}/agreement/online`,
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

export function useGenerateSponsoringInvoiceMutation() {
  const moneiz = useMoneiz();
  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
      invoiceReq,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
      invoiceReq: InvoiceReq;
    }) => {
      await moneiz.post(
        `/api/admin/${eventId}/sponsorings/${sponsoringId}/invoice/generate`,
        invoiceReq,
      );
    },
  });
}

export function useDeleteSponsoringMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
    }) => {
      await moneiz.delete(`/api/admin/${eventId}/sponsorings/${sponsoringId}`);
    },
    onSuccess: async (_data, { eventId, sponsoringId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getListSponsoringsOptions(moneiz, eventId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getSponsoringOptions(moneiz, eventId, sponsoringId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getAlreadyAssignedStandsOptions(moneiz, eventId).queryKey,
        }),
      ]);
    },
  });
}

export function useSetPlaceMutation() {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsoringId,
      place,
    }: {
      eventId: EventId;
      sponsoringId: SponsoringId;
      place: string | undefined;
    }) => {
      await moneiz.post(
        `/api/admin/${eventId}/sponsorings/${sponsoringId}/place`,
        { place },
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
        queryClient.invalidateQueries({
          queryKey: getAlreadyAssignedStandsOptions(moneiz, eventId).queryKey,
        }),
      ]);
    },
  });
}
