import { queryOptions, useQuery } from '@tanstack/vue-query';
import type { AxiosInstance } from 'axios';

import type { SponsorApplicationRes } from '@/dto/moneiz/SponsorApplicationRes';
import { useMoneiz } from '@/utils/useAxios';

const useSponsorApplicationsOptions = (
  moneiz: AxiosInstance,
) => queryOptions({
  queryKey: ['moneiz', 'admin', 'sponsor-applications'],
  queryFn: async () => {
    const { data } = await moneiz.get<SponsorApplicationRes[]>(
      `/api/admin/sponsor-applications`,
    );
    return data;
  },
});

export const useSponsorApplications = () => {
  const moneiz = useMoneiz();
  return useQuery(useSponsorApplicationsOptions(moneiz));
};
