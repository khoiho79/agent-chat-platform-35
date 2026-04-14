import { runAgent } from '../../../lib/agentService'
import { getMessagesByConversation, createMessage } from '../../../lib/messageService'
import { getTasks } from '../../../lib/taskService'
import { getRecentMemory } from '../../../lib/memoryService'
import { getRecentNotes } from '../../../lib/noteService'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId = 'default', message } = req.body || {}

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    await createMessage({
      conversationId,
      role: 'user',
      content: String(message).trim()
    })

    const agentResponse = await runAgent({
      conversationId,
      input: String(message).trim(),
      userId: 'default-user'
    })

    await createMessage({
      conversationId,
      role: 'assistant',
      content: agentResponse.reply
    })

    const [messages, tasks, memory, notes] = await Promise.all([
      getMessagesByConversation(conversationId),
      getTasks(),
      getRecentMemory('default-user'),
      getRecentNotes()
    ])

    return res.status(200).json({
      reply: agentResponse.reply,
      trace: agentResponse.trace,
      messages,
      tasks,
      memory,
      notes
    })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
