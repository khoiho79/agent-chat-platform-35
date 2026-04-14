import { createTask, getTasks, updateTask } from './taskService'
import { createNote, getRecentNotes } from './noteService'
import { getRecentMemory, saveMemoryContext } from './memoryService'

async function searchToolRun(query) {
  return {
    type: 'search',
    result: `Internal search result for: ${query}`
  }
}

async function notesToolRun(input) {
  if (input.action === 'save') {
    const note = await createNote({ content: input.content })
    return { type: 'notes', action: 'save', note }
  }
  const notes = await getRecentNotes()
  return { type: 'notes', action: 'list', notes }
}

async function taskToolRun(input) {
  if (input.action === 'create') {
    const task = await createTask(input.payload)
    return { type: 'task', action: 'create', task }
  }
  if (input.action === 'update') {
    const task = await updateTask(input.id, input.payload)
    return { type: 'task', action: 'update', task }
  }
  const tasks = await getTasks()
  return { type: 'task', action: 'list', tasks }
}

async function memoryToolRun(input) {
  if (input.action === 'save') {
    const memory = await saveMemoryContext(input.userId, input.key, input.value)
    return { type: 'memory', action: 'save', memory }
  }
  const memory = await getRecentMemory(input.userId)
  return { type: 'memory', action: 'list', memory }
}

export async function executeTool(toolName, input) {
  switch (toolName) {
    case 'search':
      return await searchToolRun(input)
    case 'notes':
      return await notesToolRun(input)
    case 'task':
      return await taskToolRun(input)
    case 'memory':
      return await memoryToolRun(input)
    default:
      throw new Error('Unknown tool')
  }
}
