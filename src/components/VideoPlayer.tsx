import { useEffect, useRef } from 'react'
import { Badge } from './ui/badge'
import { Mic, MicOff, Video, VideoOff, Hand } from 'lucide-react'

interface VideoPlayerProps {
  stream?: MediaStream
  name: string
  isMuted: boolean
  isVideoOn: boolean
  isHandRaised?: boolean
  isLocal?: boolean
  className?: string
}

export default function VideoPlayer({
  stream,
  name,
  isMuted,
  isVideoOn,
  isHandRaised = false,
  isLocal = false,
  className = ''
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    let isActive = true // Track if effect is still active
    
    if (videoElement && stream && isVideoOn) {
      console.log('Setting video stream for:', name, stream)
      
      // Create a new function to handle stream setup
      const setupStream = async () => {
        try {
          // Only proceed if effect is still active
          if (!isActive || !videoElement) return
          
          // Pause and clear current stream safely
          try {
            videoElement.pause()
          } catch (e) {
            // Ignore pause errors
          }
          
          videoElement.srcObject = null
          
          // Small delay to ensure cleanup
          await new Promise(resolve => setTimeout(resolve, 10))
          
          // Check again if effect is still active
          if (!isActive || !videoElement) return
          
          // Set new stream
          videoElement.srcObject = stream
          
          // Attempt to play with proper error handling
          try {
            await videoElement.play()
          } catch (err: any) {
            // Only log if it's not an expected interruption and effect is still active
            if (isActive && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              console.warn('Video play failed for', name, ':', err.message)
            }
          }
        } catch (err) {
          if (isActive) {
            console.warn('Stream setup failed for', name, ':', err)
          }
        }
      }
      
      setupStream()
    } else if (videoElement) {
      // Clear stream if no stream provided or video is off
      try {
        videoElement.pause()
      } catch (e) {
        // Ignore pause errors
      }
      videoElement.srcObject = null
    }
    
    // Cleanup function
    return () => {
      isActive = false // Mark effect as inactive
      if (videoElement) {
        try {
          videoElement.pause()
        } catch (e) {
          // Ignore pause errors during cleanup
        }
        videoElement.srcObject = null
      }
    }
  }, [stream, name, isVideoOn])

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      {stream && isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-semibold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-lg font-medium">{name}</p>
            {!isVideoOn && (
              <p className="text-sm opacity-75 mt-1">Camera off</p>
            )}
          </div>
        </div>
      )}

      {/* Overlay with name and status */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
        <Badge variant="secondary" className="bg-black/50 text-white border-none">
          {name}
        </Badge>
        
        {/* Audio status */}
        {isMuted ? (
          <Badge variant="destructive" className="bg-red-500/80">
            <MicOff className="h-3 w-3" />
          </Badge>
        ) : (
          <Badge variant="default" className="bg-green-500/80">
            <Mic className="h-3 w-3" />
          </Badge>
        )}
        
        {/* Video status */}
        {!isVideoOn && (
          <Badge variant="destructive" className="bg-red-500/80">
            <VideoOff className="h-3 w-3" />
          </Badge>
        )}
        
        {/* Hand raised */}
        {isHandRaised && (
          <Badge variant="default" className="bg-yellow-500/80">
            <Hand className="h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Speaking indicator */}
      {!isMuted && stream && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}