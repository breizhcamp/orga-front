import { QueryClient } from '@tanstack/vue-query';
import { isAxiosError } from 'axios';

const MAX_RETRY = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status !== undefined && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < MAX_RETRY;
      },
    },
  },
});
