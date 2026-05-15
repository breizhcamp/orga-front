import type { EventId } from "@/dto/kalon/Event"
import type { SponsoringList } from "@/dto/moneiz/SponsoringList"
import { useMoneiz } from "@/utils/useAxios"
import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query"

export function listSponsorings(eventId?: EventId, staleTime = 60_000): UseQueryReturnType<SponsoringList[], Error> {
  const moneiz = useMoneiz()
  return useQuery({
    queryKey: ['moneiz', eventId, 'sponsorings'],
    queryFn: async (): Promise<SponsoringList[]> => {
      if (!eventId) return []
      return (await moneiz.get<SponsoringList[]>(`/api/admin/${eventId}/sponsorings`)).data
    },
    enabled: !!eventId,
    staleTime,
    placeholderData: [],
  })
}
