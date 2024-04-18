import type { BadgeInfos } from "./BadgeInfos";

export enum SessionStatusEnum {
    ACCEPTED = 0,
    ACCEPT_QUEUE,
    NOMINATED,
    DECLINE_QUEUE,
    DECLINED,
}

export const statusToColor = (value : SessionStatusEnum): BadgeInfos => {
    switch (value) {
        case SessionStatusEnum.ACCEPTED:
            return { label: 'Accepté', color: 'primary' };
        case SessionStatusEnum.ACCEPT_QUEUE:
            return { label: 'File d\'acceptation', color: 'secondary' };
        case SessionStatusEnum.NOMINATED:
            return { label: 'Nominé', color: 'success' };
        case SessionStatusEnum.DECLINE_QUEUE:
            return { label: 'File de refus', color: 'danger' };
        case SessionStatusEnum.DECLINED:
        default:
            return { label: 'Refusé', color: 'warning' };
    }
}