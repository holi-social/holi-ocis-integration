import { createLogger, transports } from 'winston'

export const logger = createLogger({
  transports: [new transports.Console()],
  level: 'debug',
})

export const logPhase = (phaseName: String) => (fn: () => Promise<any>) => {
  const before = Date.now()
  logger.debug('Starting phase ' + phaseName)
  return fn()
  .finally(() => {
    const duration = Date.now() - before
    logger.debug('Completed phase ' + phaseName + ' after ' + duration + ' ms')
  })
}

