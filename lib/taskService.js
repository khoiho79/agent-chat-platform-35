import { query } from './db'
import { generateId } from './utils'

export async function getTasks() {
  const result = await query('SELECT * FROM tasks ORDER BY created_at DESC')
  return result.rows
}

export async function getTaskById(id) {
  const result = await query('SELECT * FROM tasks WHERE id = $1 LIMIT 1', [id])
  return result.rows[0] || null
}

export async function createTask({ title, description = '', status = 'pending', priority = 'normal' }) {
  const id = generateId()
  const result = await query(
    'INSERT INTO tasks (id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, title, description, status, priority]
  )
  return result.rows[0]
}

export async function updateTask(id, updates = {}) {
  const current = await getTaskById(id)
  if (!current) return null

  const title = updates.title ?? current.title
  const description = updates.description ?? current.description
  const status = updates.status ?? current.status
  const priority = updates.priority ?? current.priority

  const result = await query(
    'UPDATE tasks SET title = $2, description = $3, status = $4, priority = $5, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, title, description, status, priority]
  )

  return result.rows[0] || null
}

export async function deleteTask(id) {
  const result = await query('DELETE FROM tasks WHERE id = $1', [id])
  return result.rowCount > 0
}
