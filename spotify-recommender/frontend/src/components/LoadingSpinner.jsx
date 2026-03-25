export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-green-500 border-opacity-20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  )
}