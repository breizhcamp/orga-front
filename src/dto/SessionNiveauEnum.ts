import type { BadgeInfos } from "./BadgeInfos";

export enum SessionNiveauEnum {
    INTRO = 0,
    STANDARD,
    ADVANCED,
}

export const niveauToBadgeInfos = (value : SessionNiveauEnum): BadgeInfos => {
    switch (value) {
        case SessionNiveauEnum.INTRO:
            return { label: 'Introduction', color: 'primary' };
        case SessionNiveauEnum.STANDARD:
            return { label: 'Standard', color: 'secondary' };
        case SessionNiveauEnum.ADVANCED:
        default:
            return { label: 'Avancé', color: 'success' };
    }
}