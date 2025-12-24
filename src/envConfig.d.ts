type EnvConfig = "KEYCLOAK_URL" | "KEYCLOAK_REALM" | "KEYCLOAK_CLIENT_ID"

interface Window {
  envLoaded: Promise<void>
  env: Record<EnvConfig, string>
}
