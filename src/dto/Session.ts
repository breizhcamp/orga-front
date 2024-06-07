import { SessionFormatEnum } from "./SessionFormatEnum"
import { SessionNiveauEnum } from "./SessionNiveauEnum"
import { SessionStatusEnum } from "./SessionStatusEnum"
import { SessionThemeEnum } from "./SessionThemeEnum"
import type { Slot } from "./Slot"
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
    videoURL?: string | null
    rating?: number | null
    slot?: Slot | null
}

export interface SessionDTO {
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
    videoURL?: string | null
    slot?: Slot | null
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
        videoURL: dto.videoURL,
        rating: dto.rating ? Number(dto.rating) : null,
        slot: dto.slot
    }
}

export interface ManualSession {
    id: number

    title: string
    description: string
    format: SessionFormatEnum
    theme: SessionThemeEnum
}

export interface ManualSessionDTO {
    id: number
    
    title: string
    description: string
    format: string
    theme: string
}

export const manualSessionDTOToManualSession = (dto: ManualSessionDTO): ManualSession => {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        format: SessionFormatEnum[dto.format as keyof typeof SessionFormatEnum],
        theme: SessionThemeEnum[dto.theme as keyof typeof SessionThemeEnum],
    }
}
