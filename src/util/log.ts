import chalk from 'chalk'
import { config } from '../config'

const LOG_PREFIX = 'RESOURCE_UPLOAD'

export const logger = {
  info(...args: unknown[]) {
    console.info(chalk.green(LOG_PREFIX), ...args)
  },
  error(...args: unknown[]) {
    console.error(chalk.red(LOG_PREFIX), ...args)
  },
  debug(...args: unknown[]) {
    if (config.debug) {
      console.debug(chalk.red(LOG_PREFIX), ...args)
    }
  },
}
