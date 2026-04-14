import { createNote, getRecentNotes } from '../../lib/noteService'
import { saveMemoryContext } from '../../lib/memoryService'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const notes = await getRecentNotes()
      return res.status(200).json({ notes })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { content } = req.body || {}
      if (!content || !String(content).trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }
      const note = await createNote({ content: String(content).trim() })
      await saveMemoryContext('default-user', 'note', String(content).trim())
      return res.status(201).json({ note })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
