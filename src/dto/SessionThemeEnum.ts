import type { BadgeInfos } from "./BadgeInfos";

export enum SessionThemeEnum {
    WEB = 0,
    METHODS,
    DATA,
    ARCHI,
    DEV,
    IOT,
    MOBILE,
    AI,
    GREEN,
    DEVOPS,
    SEC,
    OTHER,
    KEYNOTE,
}

export const themeToColor = (value : SessionThemeEnum): BadgeInfos => {
    switch (value) {
        case SessionThemeEnum.WEB:
            return { label: 'Web', color: 'primary' };
        case SessionThemeEnum.METHODS:
            return { label: 'Méthodologie', color: 'primary' };
        case SessionThemeEnum.DATA:
            return { label: 'Data', color: 'secondary' };
        case SessionThemeEnum.ARCHI:
            return { label: 'Architecture', color: 'secondary' };
        case SessionThemeEnum.DEV:
            return { label: 'Développement', color: 'success' };
        case SessionThemeEnum.IOT:
            return { label: 'IoT Embarqué', color: 'success' };
        case SessionThemeEnum.MOBILE:
            return { label: 'Mobile', color: 'danger' };
        case SessionThemeEnum.AI:
            return { label: 'IA', color: 'danger' };
        case SessionThemeEnum.GREEN:
            return { label: 'Écoconception', color: 'warning' };
        case SessionThemeEnum.DEVOPS:
            return { label: 'DevOps', color: 'warning' };
        case SessionThemeEnum.SEC:
            return { label: 'Sécurité', color: 'info' };
        case SessionThemeEnum.OTHER:
            return { label: 'Autre...', color: 'light' };
        case SessionThemeEnum.KEYNOTE:
        default:
            return { label: 'Keynote', color: 'dark' };
    }
}