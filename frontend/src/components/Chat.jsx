import { useState, useRef, useEffect } from 'react'
import Loader from './Loader'

export default function Chat({ chat, loading, setChat }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setChat([
      ...chat,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '🤖 (respuesta simulada)' }
    ])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat, loading])

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 space-y-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
      >
        {chat.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">Start by recording a sign language video or typing a message!</p>
            <p className="text-sm mt-2">I'll translate or reply for you</p>
          </div>
        )}

        {chat.map((m, i) => (
          <div key={i} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-3 rounded-2xl max-w-xs break-words shadow ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && <Loader />}
      </div>

      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl shadow-md transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
