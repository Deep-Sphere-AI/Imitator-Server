import React, { useState, useEffect } from 'react'
import Chat from './components/Chat'
import Loader from './components/Loader'
import VideoRecorder from './components/VideoRecorder'

export default function App() {
  const [chat, setChat] = useState([])
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => () => clearTimeout(), [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Chat Column */}
      <div className="w-1/2 border-r border-gray-300 p-6 flex flex-col bg-white shadow-lg">
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
          <h2 className="text-2xl font-bold text-gray-800">💬 AI Sign Translator</h2>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-xl shadow-inner">
          <Chat chat={chat} loading={loading} />
        </div>
      </div>

      {/* Video Column */}
      <VideoRecorder
        recording={recording}
        setRecording={setRecording}
        chat={chat}
        setChat={setChat}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  )
}
