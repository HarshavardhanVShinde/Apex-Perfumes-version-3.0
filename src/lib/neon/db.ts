import { neon, neonConfig } from '@neondatabase/serverless'

// poolQueryViaFetch is the recommended approach for serverless environments
// fetchConnectionCache is now always true by default (removed deprecated config)
neonConfig.poolQueryViaFetch = true

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please provide your Neon connection string.')
}

export const sql = neon(connectionString)
