import { query } from './db'
import { generateId } from './utils'

export async function createNote({ content }) {
  const id = generateId()
  const result = await query(
    'INSERT INTO notes (id, content) VALUES ($1, $2) RETURNING *',
    [id, content]
  )
  return result.rows[0]
}

export async function getRecentNotes() {
  const result = await query('SELECT * FROM notes ORDER BY created_at DESC LIMIT 20')
  return result.rows
}
