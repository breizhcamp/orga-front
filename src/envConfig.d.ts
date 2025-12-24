type EnvConfig =
  "KEYCLOAK_URL" | "KEYCLOAK_REALM" | "KEYCLOAK_CLIENT_ID" |
  "KALON_URL" | "MONEIZ_URL"

interface Window {
  envLoaded: Promise<void>
  env: Record<EnvConfig, string>
}
