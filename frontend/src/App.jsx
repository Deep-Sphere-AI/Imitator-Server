import React, { useRef, useState, useEffect } from 'react'

export default function App() {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [chat, setChat] = useState([])
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef(null)
  const MAX_MS = 60 * 1000 // 1 minute limit

  // Attempt constraints in order
  const constraintsList = [
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: true },
  ]

  async function getCameraStream() {
    for (let constraints of constraintsList) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        console.warn('Constraint failed', constraints, err.name)
        if (err.name !== 'OverconstrainedError') throw err
      }
    }
    throw new Error('No valid camera configuration.')
  }

  const startRecording = async () => {
    console.log('startRecording()')
    let stream
    try {
      stream = await getCameraStream()
    } catch (err) {
      console.error('Camera error', err)
      alert('Cannot access camera: ' + err.message)
      return
    }

    videoRef.current.srcObject = stream
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    mediaRecorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      clearTimeout(timeoutRef.current)
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'video.webm', { type: 'video/webm' })

      // Add user placeholder
      const updatedChat = [...chat, { role: 'user', content: '🎥 Sent video...' }]
      setChat(updatedChat)
      setLoading(true)

      try {
        const form = new FormData()
        form.append('video', file)
        const res = await fetch('/process_video', { method: 'POST', body: form })
        const { response } = await res.json()
        setChat([...updatedChat, { role: 'assistant', content: response }])
      } catch (err) {
        setChat([...updatedChat, { role: 'assistant', content: '❌ Error sending video.' }])
      } finally {
        setLoading(false)
      }
    }

    recorder.start()
    setRecording(true)
    timeoutRef.current = setTimeout(stopRecording, MAX_MS)
  }

  const stopRecording = () => {
    console.log('stopRecording()')
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
    }
    mediaRecorderRef.current.stop()
    setRecording(false)
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className="flex h-full">
      {/* Chat Column */}
      <div className="w-1/2 border-r p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">💬 Conversation</h2>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-3 rounded">
          {chat.map((m, i) => (
            <div key={i} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-xs break-words ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-gray-500 mt-2">⏳ Processing…</div>}
        </div>
      </div>

      {/* Video Column */}
      <div className="w-1/2 p-4 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-2">📹 Record Signs</h2>
        <video ref={videoRef} autoPlay muted className="w-full h-auto border rounded mb-4" />
        {!recording ? (
          <button onClick={startRecording} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50">
            ▶️ Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
            ⏹ Stop Recording
          </button>
        )}
        <p className="text-sm text-gray-500 mt-2">Max recording: 60s</p>
      </div>
    </div>
  )
}