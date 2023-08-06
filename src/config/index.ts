import dotenv from 'dotenv'

dotenv.config()

const env = process.env

export const config = {
  debug: !!(env.DEBUG && env.DEBUG === 'true'),
  ossType: '',
  ossPrefix: '',
  ossAliRegion: env.OSS_ALI_REGION || '',
  ossAliBucket: env.OSS_ALI_BUCKET || '',
  ossAliAccessKeyId: env.OSS_ALI_ACCESS_KEY_ID || '',
  ossAliAccessKeySecrect: env.OSS_ALI_ACCESS_KEY_SECRECT || '',
}

export const updateConfig = (_config: Partial<typeof config>) => {
  Object.assign(config, _config)
}
