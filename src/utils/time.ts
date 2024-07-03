import dayjs from "dayjs"
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import durationPlugin from 'dayjs/plugin/duration';


export const beautifyTime = (time: string): string => {
  dayjs.extend(customParseFormat)

  return dayjs(time, "H:mm:ss").format("HH:mm")
}
  
export const beautifyDuration = (duration: string): string => {
  dayjs.extend(durationPlugin)
  dayjs.extend(relativeTime)

  const dayJsDuration = dayjs.duration(duration)
  return dayJsDuration.locale('en').humanize()
}