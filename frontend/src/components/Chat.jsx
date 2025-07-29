import Loader from './Loader'

export default function Chat({ chat, loading }) {
  if (chat.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <div className="text-6xl mb-4">🤖</div>
        <p className="text-lg">Start by recording a sign language video!</p>
        <p className="text-sm mt-2">I'll translate it for you</p>
      </div>
    )
  }

  return (
    <>
      {chat.map((m, i) => (
        <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`px-4 py-3 rounded-2xl max-w-xs break-words shadow-sm ${
            m.role === 'user'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}>
            {m.content}
          </div>
        </div>
      ))}
      {loading && <Loader />}
    </>
  )
}
