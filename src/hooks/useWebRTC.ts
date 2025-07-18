import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebRTCProps {
  roomId: string
  userId: string
  userName: string
}

interface Participant {
  id: string
  name: string
  stream?: MediaStream
  isMuted: boolean
  isVideoOn: boolean
  isHandRaised: boolean
}

export function useWebRTC({ roomId, userId, userName }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const screenShareRef = useRef<MediaStream | null>(null)
  const originalStreamRef = useRef<MediaStream | null>(null)
  const isInitializedRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(true)

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    if (isInitializedRef.current || !mountedRef.current) return
    
    try {
      console.log('Requesting camera and microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      if (!mountedRef.current) {
        // Component unmounted during async operation
        stream.getTracks().forEach(track => track.stop())
        return
      }
      
      console.log('Media stream obtained:', stream)
      
      // Store original stream reference for screen share restoration
      originalStreamRef.current = stream
      setLocalStream(stream)
      
      // Add yourself as a participant with the stream
      setParticipants(prev => {
        const filtered = prev.filter(p => p.id !== userId)
        return [
          ...filtered,
          {
            id: userId,
            name: userName,
            stream,
            isMuted: false,
            isVideoOn: true,
            isHandRaised: false
          }
        ]
      })
      
      setError(null)
      isInitializedRef.current = true
      
      // Set up cleanup function
      cleanupRef.current = () => {
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('Stopped track:', track.kind)
        })
      }
      
    } catch (err) {
      if (!mountedRef.current) return
      
      console.error('Error accessing media devices:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to access camera/microphone: ${errorMessage}. Please check permissions and try again.`)
    }
  }, [userId, userName])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStream || !mountedRef.current) return
    
    try {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
        
        // Update participant state
        setParticipants(prev => 
          prev.map(p => 
            p.id === userId ? { ...p, isMuted: !isMuted } : p
          )
        )
      }
    } catch (err) {
      console.error('Error toggling mute:', err)
      setError('Failed to toggle microphone')
    }
  }, [localStream, isMuted, userId])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localStream || !mountedRef.current) return
    
    try {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
        
        // Update participant state
        setParticipants(prev => 
          prev.map(p => 
            p.id === userId ? { ...p, isVideoOn: !isVideoOn } : p
          )
        )
      }
    } catch (err) {
      console.error('Error toggling video:', err)
      setError('Failed to toggle camera')
    }
  }, [localStream, isVideoOn, userId])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (!mountedRef.current) return
    
    try {
      if (screenShareRef.current) {
        screenShareRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('Stopped screen share track:', track.kind)
        })
        screenShareRef.current = null
      }
      
      setIsScreenSharing(false)
      setError(null)
      
      // Restore original camera stream
      if (originalStreamRef.current) {
        setLocalStream(originalStreamRef.current)
        
        // Update participant state
        setParticipants(prev => 
          prev.map(p => 
            p.id === userId ? { ...p, stream: originalStreamRef.current } : p
          )
        )
      }
    } catch (err) {
      console.error('Error stopping screen share:', err)
      setError('Failed to stop screen sharing')
    }
  }, [userId])

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    if (!mountedRef.current) return
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: true
      })
      
      if (!mountedRef.current) {
        // Component unmounted during async operation
        screenStream.getTracks().forEach(track => track.stop())
        return
      }
      
      screenShareRef.current = screenStream
      setIsScreenSharing(true)
      setError(null)
      
      // Create combined stream with screen video and original audio
      if (originalStreamRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0]
        
        // Stop screen share when user stops sharing
        videoTrack.onended = () => {
          console.log('Screen share ended by user')
          stopScreenShare()
        }
        
        // Create new stream with screen video and original audio
        const combinedStream = new MediaStream([
          videoTrack,
          ...originalStreamRef.current.getAudioTracks()
        ])
        
        setLocalStream(combinedStream)
        
        // Update participant state
        setParticipants(prev => 
          prev.map(p => 
            p.id === userId ? { ...p, stream: combinedStream } : p
          )
        )
      }
      
    } catch (err) {
      if (!mountedRef.current) return
      
      console.error('Error starting screen share:', err)
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Screen sharing permission denied. Please allow screen sharing and try again.')
        } else if (err.name === 'NotSupportedError') {
          setError('Screen sharing is not supported in this browser.')
        } else if (err.name === 'AbortError') {
          // User cancelled, don't show error
          console.log('Screen sharing was cancelled by user')
        } else {
          setError(`Screen sharing failed: ${err.message}`)
        }
      } else {
        setError('Failed to start screen sharing. Please try again.')
      }
      
      setIsScreenSharing(false)
    }
  }, [stopScreenShare, userId])

  // Toggle screen sharing
  const toggleScreenShare = useCallback(() => {
    if (!mountedRef.current) return
    
    if (isScreenSharing) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare])

  // End call - cleanup all streams
  const endCall = useCallback(() => {
    console.log('Ending call and cleaning up...')
    
    try {
      // Clean up local stream
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      
      // Clean up screen share
      if (screenShareRef.current) {
        screenShareRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('Stopped screen share track on end call:', track.kind)
        })
        screenShareRef.current = null
      }
      
      // Reset all state
      setLocalStream(null)
      setParticipants([])
      setIsScreenSharing(false)
      setError(null)
      isInitializedRef.current = false
      originalStreamRef.current = null
    } catch (err) {
      console.error('Error during cleanup:', err)
    }
  }, [])

  // Initialize media on mount
  useEffect(() => {
    mountedRef.current = true
    
    const init = async () => {
      await initializeMedia()
      
      // Add mock participants after initialization
      if (mountedRef.current && isInitializedRef.current) {
        const mockParticipants: Participant[] = [
          {
            id: 'demo-user-1',
            name: 'John Doe',
            isMuted: true,
            isVideoOn: true,
            isHandRaised: false
          },
          {
            id: 'demo-user-2',
            name: 'Jane Smith',
            isMuted: false,
            isVideoOn: false,
            isHandRaised: true
          }
        ]
        
        setTimeout(() => {
          if (mountedRef.current) {
            setParticipants(prev => {
              const existingIds = prev.map(p => p.id)
              const newParticipants = mockParticipants.filter(mock => 
                !existingIds.includes(mock.id)
              )
              return [...prev, ...newParticipants]
            })
          }
        }, 2000)
      }
    }
    
    init()
    
    return () => {
      console.log('useWebRTC cleanup on unmount')
      mountedRef.current = false
      endCall()
    }
  }, [initializeMedia, endCall])

  return {
    localStream,
    participants,
    isMuted,
    isVideoOn,
    isScreenSharing,
    error,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall
  }
}