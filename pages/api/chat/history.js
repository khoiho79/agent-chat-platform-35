import { getMessagesByConversation } from '../../../lib/messageService'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId = 'default' } = req.query
    const messages = await getMessagesByConversation(String(conversationId))
    return res.status(200).json({ messages })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
