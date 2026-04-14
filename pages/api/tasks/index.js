import { createTask, getTasks } from '../../../lib/taskService'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tasks = await getTasks()
      return res.status(200).json({ tasks })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description = '', priority = 'normal' } = req.body || {}
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Title is required' })
      }
      const task = await createTask({
        title: String(title).trim(),
        description: String(description || ''),
        priority: String(priority || 'normal')
      })
      return res.status(201).json({ task })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
