import { query } from './db'
import { generateId } from './utils'

export async function createMessage({ conversationId, role, content }) {
  const id = generateId()
  const result = await query(
    'INSERT INTO messages (id, conversation_id, role, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, conversationId, role, content]
  )
  return result.rows[0]
}

export async function getMessagesByConversation(conversationId) {
  const result = await query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  )
  return result.rows
}
