import { useEffect, useMemo, useState } from 'react'

const defaultConversationId = 'default'

function statusClass(status) {
  if (status === 'done') return 'badge success'
  if (status === 'in_progress') return 'badge warning'
  return 'badge'
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')

  const [conversationId] = useState(defaultConversationId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const [tasks, setTasks] = useState([])
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'normal'
  })
  const [taskLoading, setTaskLoading] = useState(false)

  const [notes, setNotes] = useState([])
  const [memory, setMemory] = useState([])
  const [noteInput, setNoteInput] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)

  const taskStats = useMemo(() => {
    const total = tasks.length
    const pending = tasks.filter((t) => t.status === 'pending').length
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const done = tasks.filter((t) => t.status === 'done').length
    return { total, pending, inProgress, done }
  }, [tasks])

  async function loadMessages() {
    const res = await fetch(`/api/chat/history?conversationId=${conversationId}`)
    const data = await res.json()
    setMessages(data.messages || [])
  }

  async function loadTasks() {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data.tasks || [])
  }

  async function loadNotes() {
    const res = await fetch('/api/notes')
    const data = await res.json()
    setNotes(data.notes || [])
  }

  async function loadMemory() {
    const res = await fetch('/api/memory')
    const data = await res.json()
    setMemory(data.memory || [])
  }

  async function bootstrap() {
    await Promise.all([loadMessages(), loadTasks(), loadNotes(), loadMemory()])
  }

  useEffect(() => {
    bootstrap()
  }, [])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userText
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      setMessages(data.messages || [])
      if (data.tasks) setTasks(data.tasks)
      if (data.memory) setMemory(data.memory)
      if (data.notes) setNotes(data.notes)
    } catch (err) {
      alert(err.message)
    } finally {
      setChatLoading(false)
    }
  }

  async function createTask(e) {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    setTaskLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create task')
      setTaskForm({ title: '', description: '', priority: 'normal' })
      await loadTasks()
    } catch (err) {
      alert(err.message)
    } finally {
      setTaskLoading(false)
    }
  }

  async function updateTask(id, updates) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to update task')
      return
    }
    await loadTasks()
  }

  async function deleteTask(id) {
    const ok = window.confirm('Delete this task?')
    if (!ok) return
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to delete task')
      return
    }
    await loadTasks()
  }

  async function saveNote(e) {
    e.preventDefault()
    if (!noteInput.trim()) return
    setNoteLoading(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteInput.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save note')
      setNoteInput('')
      await Promise.all([loadNotes(), loadMemory()])
    } catch (err) {
      alert(err.message)
    } finally {
      setNoteLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="logo">Agent Platform</div>
          <p className="subtitle">A simple AI agent MVP with chat, tasks, notes, and persistent memory.</p>
        </div>

        <nav className="nav">
          <button className={activeTab === 'chat' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('chat')}>Chat</button>
          <button className={activeTab === 'tasks' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('tasks')}>Tasks</button>
          <button className={activeTab === 'notes' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('notes')}>Notes & Memory</button>
        </nav>

        <div className="sidebar-card stats">
          <h3>Task Overview</h3>
          <div className="stat-row"><span>Total</span><strong>{taskStats.total}</strong></div>
          <div className="stat-row"><span>Pending</span><strong>{taskStats.pending}</strong></div>
          <div className="stat-row"><span>In Progress</span><strong>{taskStats.inProgress}</strong></div>
          <div className="stat-row"><span>Done</span><strong>{taskStats.done}</strong></div>
        </div>
      </aside>

      <main className="main">
        {activeTab === 'chat' && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h1>Agent Chat</h1>
                <p>Use natural language to create tasks, update status, save notes, and inspect memory.</p>
              </div>
            </div>

            <div className="chat-window">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <h3>Start the ReAct loop</h3>
                  <p>Try messages like “create a task to ship MVP”, “mark task 1 done”, “save note remember Vercel deploy”, or “show my tasks”.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'user' ? 'message user' : 'message assistant'}>
                    <div className="message-role">{msg.role === 'user' ? 'You' : 'Agent'}</div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))
              )}
            </div>

            <form className="composer" onSubmit={sendMessage}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the agent to manage tasks, save notes, or summarize memory..."
                rows={3}
              />
              <button type="submit" disabled={chatLoading}>{chatLoading ? 'Thinking...' : 'Send'}</button>
            </form>
          </section>
        )}

        {activeTab === 'tasks' && (
          <section className="panel two-col">
            <div className="card">
              <h2>Create Task</h2>
              <form className="stack" onSubmit={createTask}>
                <input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title"
                />
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Description"
                  rows={4}
                />
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
                <button type="submit" disabled={taskLoading}>{taskLoading ? 'Saving...' : 'Create Task'}</button>
              </form>
            </div>

            <div className="card">
              <div className="section-title-row">
                <h2>Task List</h2>
                <button className="ghost-btn" onClick={loadTasks}>Refresh</button>
              </div>

              <div className="task-list">
                {tasks.length === 0 ? (
                  <div className="empty-inline">No tasks yet.</div>
                ) : tasks.map((task) => (
                  <div className="task-item" key={task.id}>
                    <div className="task-main">
                      <div className="task-head">
                        <h3>{task.title}</h3>
                        <span className={statusClass(task.status)}>{task.status.replace('_', ' ')}</span>
                      </div>
                      {task.description ? <p>{task.description}</p> : null}
                      <div className="meta-row">
                        <span className="pill">Priority: {task.priority}</span>
                        <span className="pill subtle">ID: {task.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <select value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value })}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button className="ghost-btn" onClick={() => deleteTask(task.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'notes' && (
          <section className="panel two-col">
            <div className="card">
              <h2>Quick Notes</h2>
              <form className="stack" onSubmit={saveNote}>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Save a lightweight note the agent can reference later"
                  rows={5}
                />
                <button type="submit" disabled={noteLoading}>{noteLoading ? 'Saving...' : 'Save Note'}</button>
              </form>

              <div className="notes-list">
                {notes.length === 0 ? (
                  <div className="empty-inline">No notes yet.</div>
                ) : notes.map((note) => (
                  <div className="note-item" key={note.id}>
                    <div>{note.content}</div>
                    <small>{new Date(note.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-title-row">
                <h2>Recent Memory</h2>
                <button className="ghost-btn" onClick={loadMemory}>Refresh</button>
              </div>
              <div className="memory-list">
                {memory.length === 0 ? (
                  <div className="empty-inline">No memory entries yet.</div>
                ) : memory.map((entry) => (
                  <div className="memory-item" key={entry.id}>
                    <div className="memory-key">{entry.memory_key}</div>
                    <div className="memory-value">{entry.value}</div>
                    <small>{new Date(entry.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
