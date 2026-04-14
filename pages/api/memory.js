import { getRecentMemory } from '../../lib/memoryService'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const memory = await getRecentMemory('default-user')
    return res.status(200).json({ memory })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
