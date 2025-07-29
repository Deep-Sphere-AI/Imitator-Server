export default function Loader() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-cloud px-4 py-3 rounded-2xl shadow-sm border border-lilac/30">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-lilac/70 rounded-full animate-[bounce_1.2s_infinite]"></div>
            <div
              className="w-2 h-2 bg-lilac/70 rounded-full animate-[bounce_1.2s_infinite]"
              style={{ animationDelay: '0.15s' }}
            ></div>
            <div
              className="w-2 h-2 bg-lilac/70 rounded-full animate-[bounce_1.2s_infinite]"
              style={{ animationDelay: '0.3s' }}
            ></div>
          </div>
          <span className="text-midnight text-sm">Translating your signs…</span>
        </div>
      </div>
    </div>
  )
}
