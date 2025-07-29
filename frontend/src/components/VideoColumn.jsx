import VideoRecorder from './VideoRecorder'

export default function VideoColumn(props) {
  return (
    <div className="w-1/2 p-6 flex flex-col items-center bg-gradient-to-b from-gray-900 to-gray-800">
      <VideoRecorder {...props} />
    </div>
  )
}
