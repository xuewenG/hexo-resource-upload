import dotenv from 'dotenv'

dotenv.config()

const env = process.env

export const config = {
  debug: !!(env.DEBUG && env.DEBUG === 'true'),
  ssoType: '',
  ssoPrefix: '',
  ssoAliRegion: env.SSO_ALI_REGION || '',
  ssoAliBucket: env.SSO_ALI_BUCKET || '',
  ssoAliAccessKeyId: env.SSO_ALI_ACCESS_KEY_ID || '',
  ssoAliAccessKeySecrect: env.SSO_ALI_ACCESS_KEY_SECRECT || '',
}

export const updateConfig = (_config: Partial<typeof config>) => {
  Object.assign(config, _config)
}
