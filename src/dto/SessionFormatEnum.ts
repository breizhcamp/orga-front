import type { BadgeInfos } from "./BadgeInfos";

export enum SessionFormatEnum {
    CONFERENCE = 0,
    UNIVERSITY,
    TOOL,
    QUICKY,
    KEYNOTE,
}

export const formatToBadgeInfos = (value : SessionFormatEnum): BadgeInfos => {
    switch (value) {
        case SessionFormatEnum.CONFERENCE:
            return { label: 'Conférence', color: 'primary' };
        case SessionFormatEnum.UNIVERSITY:
            return { label: 'Université', color: 'secondary' };
        case SessionFormatEnum.TOOL:
            return { label: 'Tool in action', color: 'success' };
        case SessionFormatEnum.QUICKY:
            return { label: 'Quicky', color: 'danger' };
        case SessionFormatEnum.KEYNOTE:
        default:
            return { label: 'Keynote', color: 'warning' };
    }
}

export const formatToMinutes = (value: SessionFormatEnum): number | undefined => {
    switch (value) {
        case SessionFormatEnum.CONFERENCE:
            return 55;
        case SessionFormatEnum.UNIVERSITY: 
            return 120;
        case SessionFormatEnum.TOOL:
            return 25;
        case SessionFormatEnum.QUICKY:
            return 15;
        default:
            return undefined;
    }
}
