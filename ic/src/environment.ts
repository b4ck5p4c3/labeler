import { config } from 'dotenv'
import z from 'zod'

const environmentType = z.object({
  DIGIKEY_CLIENT_ID: z.string(),
  DIGIKEY_CLIENT_SECRET: z.string()
})

type Environment = z.infer<typeof environmentType>

export function getEnvironment (): Environment {
  config({
    quiet: true,
  })
  return environmentType.parse(process.env)
}
