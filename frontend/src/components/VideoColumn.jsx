import VideoRecorder from './VideoRecorder'

export default function VideoColumn(props) {
  return (
    <div className="w-1/2 p-6 flex flex-col items-center bg-gradient-to-b from-midnight to-[#1e2a38] text-cloud border-l border-midnight shadow-lg rounded-l-2xl">
      <VideoRecorder {...props} />
    </div>
  )
}
