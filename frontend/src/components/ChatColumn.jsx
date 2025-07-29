import Chat from './Chat'

export default function ChatColumn({ chat, loading, setChat }) {  return (
    <div className="w-1/2 border-r border-gray-300 p-6 flex flex-col bg-white shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
        <h2 className="text-2xl font-bold text-gray-800">💬 AI Sign Translator</h2>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-xl shadow-inner">
        <Chat chat={chat} loading={loading} setChat={setChat} />
      </div>
    </div>
  )
}
