import type { EventId } from "@/dto/kalon/Event"
import type { LevelList } from "@/dto/moneiz/LevelList"
import { useMoneiz } from "@/utils/useAxios"
import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query"

export function listLevels(eventId?: EventId, staleTime: number = 60_000): UseQueryReturnType<LevelList[], Error> {
  const moneiz = useMoneiz()
  return useQuery({
    queryKey: ['moneiz', eventId, 'levels'],
    queryFn: async (): Promise<LevelList[]> => {
      if (!eventId) return []
      return (await moneiz.get<LevelList[]>(`/api/admin/${eventId}/levels`)).data
    },
    enabled: !!eventId,
    staleTime,
    placeholderData: [],
  })
}
