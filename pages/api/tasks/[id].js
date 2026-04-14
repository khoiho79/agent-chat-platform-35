import { deleteTask, getTaskById, updateTask } from '../../../lib/taskService'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const task = await getTaskById(String(id))
      if (!task) return res.status(404).json({ error: 'Task not found' })
      return res.status(200).json({ task })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const task = await updateTask(String(id), req.body || {})
      if (!task) return res.status(404).json({ error: 'Task not found' })
      return res.status(200).json({ task })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteTask(String(id))
      if (!deleted) return res.status(404).json({ error: 'Task not found' })
      return res.status(200).json({ success: true })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
