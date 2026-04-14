import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
const schemaName = process.env.SCHEMA_NAME || 'project_35'

let pool

declareGlobal()

function declareGlobal() {
  if (!global.__agentPlatformPool) {
    global.__agentPlatformPool = new Pool({
      connectionString,
      ssl: connectionString && connectionString.includes('localhost') ? false : connectionString ? { rejectUnauthorized: false } : false
    })
  }
  pool = global.__agentPlatformPool
}

export async function query(text, params = []) {
  if (!pool) declareGlobal()
  if (!connectionString) {
    throw new Error('DATABASE_URL is required')
  }
  const client = await pool.connect()
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    await client.query(`SET search_path TO ${schemaName}`)
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

export { schemaName }
