import { query } from './db'
import { generateId } from './utils'

export async function saveMemoryContext(userId, key, value) {
  const id = generateId()
  const result = await query(
    'INSERT INTO memory (id, user_id, memory_key, value) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, userId, key, value]
  )
  return result.rows[0]
}

export async function getRecentMemory(userId) {
  const result = await query(
    'SELECT * FROM memory WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
    [userId]
  )
  return result.rows
}
