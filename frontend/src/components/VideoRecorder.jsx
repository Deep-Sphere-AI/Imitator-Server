import { useRef } from 'react'
import { getCameraStream } from '../hooks/useCameraStream'

export default function VideoRecorder({ recording, setRecording, chat, setChat, loading, setLoading }) {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timeoutRef = useRef(null)
  const MAX_MS = 60 * 1000

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

  return (
   <div className="w-1/2 p-6 flex flex-col items-center bg-gradient-to-b from-midnight to-[#1e2a38]">
  <h2 className="text-2xl font-bold mb-6 text-cloud">📹 Record Your Signs</h2>

  <div className="relative mb-6">
    <video
      ref={videoRef}
      autoPlay
      muted
      className="w-full h-80 bg-black border-4 border-midnight rounded-2xl shadow-2xl object-cover"
    />

    {recording && (
      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse flex items-center">
        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
        REC
      </div>
    )}

    {!videoRef.current?.srcObject && !recording && (
      <div className="absolute inset-0 flex items-center justify-center bg-[#1e2a38] rounded-2xl">
        <div className="text-center text-cloud/60">
          <div className="text-6xl mb-4">📸</div>
          <p>Camera will appear here</p>
        </div>
      </div>
    )}
  </div>

  <div className="flex flex-col items-center space-y-4">
    {!recording ? (
      <button
        onClick={startRecording}
        disabled={loading}
        className="bg-gradient-to-r from-[#1ABC9C] to-[#16A085] hover:from-[#17C3AE] hover:to-[#138D75] text-white px-8 py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 text-lg font-semibold"
      >
        <span className="text-2xl animate-vibrate">▶️</span>
        <span>Start Recording</span>
      </button>
    ) : (
      <button
        onClick={stopRecording}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 text-lg font-semibold animate-pulse"
      >
        <span className="text-2xl">⏹</span>
        <span>Stop Recording</span>
      </button>
    )}

    <div className="text-center text-cloud/60">
      <p className="text-sm">Maximum recording time: <span className="font-bold text-cloud">60 seconds</span></p>
      <p className="text-xs mt-1">Make sure your signs are clearly visible</p>
    </div>
  </div>
</div>

  )
}
