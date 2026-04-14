import { executeTool } from './toolService'

function normalize(text) {
  return text.toLowerCase().trim()
}

function parseTaskCreation(input) {
  const match = input.match(/create (?:a )?task(?: to)? (.+)/i)
  if (!match) return null
  return match[1].trim()
}

function parseTaskDone(input) {
  const idMatch = input.match(/mark task ([a-z0-9-]+) done/i)
  if (idMatch) return { mode: 'id', value: idMatch[1] }

  const titleMatch = input.match(/mark (.+) done/i)
  if (titleMatch) return { mode: 'text', value: titleMatch[1].trim() }

  return null
}

export async function runAgent({ input, userId }) {
  const trace = []
  const text = normalize(input)

  trace.push('THINK: load recent memory for context')
  const memoryContext = await executeTool('memory', { action: 'list', userId })

  if (text.includes('show my memory') || text.includes('recent memory')) {
    trace.push('ACT: memory tool list')
    const items = memoryContext.memory || []
    const reply = items.length
      ? `Here is your recent memory:\n- ${items.map((m) => `${m.memory_key}: ${m.value}`).join('\n- ')}`
      : 'No memory found yet.'
    trace.push('DONE: respond with memory summary')
    return { reply, trace }
  }

  const createTitle = parseTaskCreation(input)
  if (createTitle) {
    trace.push('THINK: user wants task creation')
    trace.push('ACT: task tool create')
    const created = await executeTool('task', {
      action: 'create',
      payload: { title: createTitle, description: '', priority: 'normal', status: 'pending' }
    })
    await executeTool('memory', {
      action: 'save',
      userId,
      key: 'task_created',
      value: created.task.title
    })
    trace.push('OBSERVE: task created and memory saved')
    return {
      reply: `Created task: "${created.task.title}".`,
      trace
    }
  }

  if (text.includes('show my tasks') || text === 'show tasks' || text === 'list tasks') {
    trace.push('ACT: task tool list')
    const result = await executeTool('task', { action: 'list' })
    const tasks = result.tasks || []
    const reply = tasks.length
      ? `Current tasks:\n- ${tasks.map((t) => `${t.title} [${t.status}]`).join('\n- ')}`
      : 'There are no tasks yet.'
    trace.push('DONE: respond with task list')
    return { reply, trace }
  }

  const doneIntent = parseTaskDone(input)
  if (doneIntent) {
    trace.push('THINK: user wants task status update')
    const tasks = await executeTool('task', { action: 'list' })
    const all = tasks.tasks || []
    let target = null

    if (doneIntent.mode === 'id') {
      target = all.find((t) => t.id.startsWith(doneIntent.value))
    } else {
      const needle = doneIntent.value.toLowerCase()
      target = all.find((t) => t.title.toLowerCase().includes(needle))
    }

    if (!target) {
      return { reply: 'I could not find a matching task to mark done.', trace }
    }

    trace.push('ACT: task tool update')
    const updated = await executeTool('task', {
      action: 'update',
      id: target.id,
      payload: { status: 'done' }
    })
    await executeTool('memory', {
      action: 'save',
      userId,
      key: 'task_completed',
      value: updated.task.title
    })
    trace.push('OBSERVE: task marked done')
    return { reply: `Marked task "${updated.task.title}" as done.`, trace }
  }

  if (text.startsWith('save note') || text.startsWith('remember')) {
    trace.push('THINK: user wants persistent note')
    const content = input.replace(/^save note/i, '').replace(/^remember/i, '').trim()
    if (!content) {
      return { reply: 'Please provide note content to save.', trace }
    }
    trace.push('ACT: notes tool save')
    await executeTool('notes', { action: 'save', content })
    await executeTool('memory', { action: 'save', userId, key: 'note', value: content })
    trace.push('OBSERVE: note and memory saved')
    return { reply: `Saved note: "${content}".`, trace }
  }

  if (text.includes('show notes') || text.includes('recent notes')) {
    trace.push('ACT: notes tool list')
    const result = await executeTool('notes', { action: 'list' })
    const notes = result.notes || []
    const reply = notes.length
      ? `Recent notes:\n- ${notes.map((n) => n.content).join('\n- ')}`
      : 'No notes saved yet.'
    trace.push('DONE: respond with notes')
    return { reply, trace }
  }

  if (text.startsWith('search ')) {
    trace.push('ACT: search tool run')
    const result = await executeTool('search', input.slice(7).trim())
    trace.push('DONE: respond with search result')
    return { reply: result.result, trace }
  }

  trace.push('THINK: fall back to contextual assistant response')
  const recent = (memoryContext.memory || []).slice(0, 3)
  const memoryHint = recent.length
    ? ` Recent memory includes: ${recent.map((m) => `${m.memory_key}=${m.value}`).join('; ')}.`
    : ''

  return {
    reply: `I can help manage tasks, notes, and memory.${memoryHint} Try asking me to create a task, list tasks, save a note, or show memory.`,
    trace
  }
}
