import type { Hall } from "./Hall"
import { SessionFormatEnum } from "./SessionFormatEnum"
import { SessionNiveauEnum } from "./SessionNiveauEnum"
import { SessionStatusEnum } from "./SessionStatusEnum"
import { SessionThemeEnum } from "./SessionThemeEnum"
import type { Speaker } from "./Speaker"

export interface Session {
    id: number

    title: string
    description: string
    owner: Speaker
    speakers: Array<Speaker>
    format: SessionFormatEnum
    theme: SessionThemeEnum
    niveau: SessionNiveauEnum
    status: SessionStatusEnum
    submitted: Date
    ownerNotes: string
    hall?: Hall | null
    beginning?: Date | null
    end?: Date | null
    videoURL?: string | null
    rating?: number | null

    checked: boolean
}

interface SessionDTO {
    id: number

    title: string
    description: string
    owner: Speaker
    speakers: Array<Speaker>
    format: string
    theme: string
    niveau: string
    status: string
    submitted: string
    ownerNotes: string
    rating?: string | null
    hall?: Hall | null
    beginning?: string | null
    end?: string | null
    videoURL?: string | null
}

export const sessionDTOToSession = (dto: SessionDTO): Session => {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        owner: dto.owner,
        speakers: dto.speakers,
        format: SessionFormatEnum[dto.format as keyof typeof SessionFormatEnum],
        theme: SessionThemeEnum[dto.theme as keyof typeof SessionThemeEnum],
        niveau: SessionNiveauEnum[dto.niveau as keyof typeof SessionNiveauEnum],
        status: SessionStatusEnum[dto.status as keyof typeof SessionStatusEnum],
        submitted: new Date(dto.submitted),
        ownerNotes: dto.ownerNotes,
        hall: dto.hall,
        beginning: dto.beginning ? new Date(dto.beginning) : null,
        end: dto.end ? new Date(dto.end) : null,
        videoURL: dto.videoURL,
        checked: false,
        rating: dto.rating ? Number(dto.rating) : null
    }
}