import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';
import { type MaybeRef, toValue } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import type {
  ConvertSponsorApplicationReq,
} from '@/dto/moneiz/ConvertSponsorApplicationReq';
import type {
  SponsorApplicationId,
  SponsorApplicationRes,
} from '@/dto/moneiz/SponsorApplicationRes';
import type { SponsoringRes } from '@/dto/moneiz/SponsoringRes';
import {
  getListSponsoringsOptions,
  getSponsoringOptions,
} from '@/queries/moneiz/sponsorings.queries';
import {
  getSponsorContactsOptions,
  getSponsorOptions,
  useSponsorsOptions,
} from '@/queries/moneiz/sponsors.queries';
import { useMoneiz } from '@/utils/useAxios';

const useSponsorApplicationsOptions = (
  moneiz: AxiosInstance,
  eventId: MaybeRef<EventId | undefined>,
) => queryOptions({
  queryKey: ['moneiz', 'admin', eventId, 'sponsor-applications'],
  queryFn: async () => {
    const eventIdValue = toValue(eventId);
    if (eventIdValue === undefined) throw new Error('event id is undefined');
    const { data } = await moneiz.get<SponsorApplicationRes[]>(
      `/api/admin/${eventIdValue}/sponsor-applications`,
    );
    return data;
  },
});

export const useSponsorApplications = (
  eventId: MaybeRef<EventId | undefined>,
) => {
  const moneiz = useMoneiz();
  return useQuery(useSponsorApplicationsOptions(moneiz, eventId));
};

export const useConvertSponsorApplicationMutation = () => {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      sponsorApplicationId,
      convertSponsorApplicationReq,
    }: {
      eventId: EventId;
      sponsorApplicationId: SponsorApplicationId;
      convertSponsorApplicationReq: ConvertSponsorApplicationReq;
    }) => {
      const { data } = await moneiz.post<SponsoringRes>(
        `/api/admin/${eventId}/sponsor-applications/${sponsorApplicationId}/convert`,
        convertSponsorApplicationReq,
      );
      return data;
    },
    onSuccess: async ({ id, sponsor }, { eventId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getListSponsoringsOptions(moneiz, eventId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getSponsoringOptions(
            moneiz,
            eventId,
            id,
          ).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: useSponsorsOptions(moneiz).queryKey,
        }),
        sponsor?.id && queryClient.invalidateQueries({
          queryKey: getSponsorOptions(moneiz, sponsor.id).queryKey,
        }),
        sponsor?.id && queryClient.invalidateQueries({
          queryKey: getSponsorContactsOptions(moneiz, sponsor.id).queryKey,
        }),

      ]);
    },
  });
};

export const useDeleteSponsorApplicationMutation = () => {
  const moneiz = useMoneiz();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sponsorApplicationId,
    }: {
      eventId: EventId;
      sponsorApplicationId: SponsorApplicationId;
    }) => {
      await moneiz.delete(
        `/api/admin/sponsor-applications/${sponsorApplicationId}`,
      );
    },
    onSuccess: async (_data, { eventId }) => {
      await queryClient.invalidateQueries({
        queryKey: useSponsorApplicationsOptions(moneiz, eventId).queryKey,
      });
    },
  });
};
