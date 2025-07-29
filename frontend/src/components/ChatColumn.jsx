import Chat from './Chat'

export default function ChatColumn({ chat, loading, setChat }) {
  return (
    <div className="w-1/2 border-r border-midnight p-6 flex flex-col h-full bg-cloud shadow-lg rounded-r-2xl">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-teal rounded-full mr-3 animate-pulse"></div>
        <h2 className="text-2xl font-bold text-midnight drop-shadow-sm">💬 AI Sign Translator</h2>
      </div>
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-teal scrollbar-track-cloud">
        <Chat chat={chat} loading={loading} setChat={setChat} />
      </div>
    </div>
  )
}
