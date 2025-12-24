// Replace string-based key by Symbol keys and add Axios clients injection keys
export const kalonAxiosKey = Symbol('kalonAxios')
export const moneizAxiosKey = Symbol('moneizAxios')

// Keep keycloak key if referenced elsewhere; update later to Symbol if needed
export const keycloakKey = 'keycloak'
