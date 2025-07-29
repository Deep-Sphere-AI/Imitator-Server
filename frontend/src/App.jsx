import React, { useState, useEffect } from 'react'
import ChatColumn from './components/ChatColumn'
import VideoColumn from './components/VideoColumn'






export default function App() {
  const [chat, setChat] = useState([])
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => () => clearTimeout(), [])

  return (
    <div className="h-screen w-screen">
      <div className="flex flex-row h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <ChatColumn chat={chat} loading={loading} setChat={setChat} />
        <VideoColumn
          recording={recording}
          setRecording={setRecording}
          chat={chat}
          setChat={setChat}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  )

}
