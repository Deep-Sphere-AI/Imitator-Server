import { useState, useRef, useEffect } from 'react'
import Loader from './Loader'

export default function Chat({ chat, loading, setChat }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setChat(prev => [
      ...prev,
      { role: 'user', content: trimmed }
    ])
    setInput('')                     
    setLoading(true)                 

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chat, { role: 'user', content: trimmed }] }),
      })

      if (!res.ok) throw new Error(`Server responded ${res.status}`)

      const { reply } = await res.json()

      // 5. Append the real assistant reply
      setChat(prev => [
        ...prev,
        { role: 'assistant', content: reply }
      ])
    } catch (err) {
      console.error(err)
      setChat(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }
      ])
    } finally {
      setLoading(false)              // 6. Hide loader
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [chat, loading])

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-3 bg-cloud rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-teal scrollbar-track-white"
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
                ? 'bg-gradient-to-r from-teal to-teal/80 text-white'
                : 'bg-white text-midnight border border-lilac'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && <Loader />}
      </div>

      <div className="mt-4 flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="💬 Type your message..."
            className="w-full px-4 py-3 pr-12 text-sm text-midnight bg-white border-2 border-cloud rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal shadow-sm transition-all duration-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {input.trim() && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal">
              💡
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-gradient-to-r from-teal to-teal/80 hover:scale-110 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-full shadow-md text-sm font-medium transition-all duration-200 transform flex items-center space-x-1"
        >
          <span>Send</span>
          <span className="text-lg animate-pulse">📩</span>
        </button>
      </div>
    </div>
  )
}
