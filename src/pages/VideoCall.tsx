import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Share2, 
  MessageSquare, 
  Users, 
  Settings,
  Brain,
  Hand,
  AlertCircle,
  Activity,
  Clock,
  TrendingUp
} from 'lucide-react'
import { blink } from '../blink/client'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Input } from '../components/ui/input'
import { ScrollArea } from '../components/ui/scroll-area'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useWebRTC } from '../hooks/useWebRTC'
import VideoPlayer from '../components/VideoPlayer'

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  isAI?: boolean
}

interface AIInsight {
  id: string
  type: 'engagement' | 'summary' | 'suggestion' | 'alert'
  title: string
  content: string
  timestamp: string
  priority: 'low' | 'medium' | 'high'
}

interface CallAnalytics {
  duration: number
  speakingTime: { [userId: string]: number }
  engagementScore: number
  participantCount: number
  questionsAsked: number
  keyTopics: string[]
}

export default function VideoCall() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showAI, setShowAI] = useState(true)
  const [chatMessage, setChatMessage] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'AI Assistant',
      message: 'Welcome to your AI-enhanced meeting! I\'m analyzing the conversation and will provide real-time insights.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAI: true
    }
  ])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [callAnalytics, setCallAnalytics] = useState<CallAnalytics>({
    duration: 0,
    speakingTime: {},
    engagementScore: 85,
    participantCount: 0,
    questionsAsked: 0,
    keyTopics: []
  })
  
  const callStartTime = useRef(Date.now())
  const analyticsInterval = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebRTC with user info
  const webRTCResult = useWebRTC({
    roomId: roomId || 'default-room',
    userId: 'current-user',
    userName: 'You'
  })
  
  const {
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
  } = webRTCResult

  // Local error state for dismissible errors
  const [localError, setLocalError] = useState<string | null>(null)
  const displayError = error || localError

  // AI Analysis Functions
  const generateAIInsight = async (type: AIInsight['type'], context: string) => {
    try {
      const prompt = `As an AI teaching assistant analyzing a video call, provide a brief insight about: ${context}. 
      Focus on ${type === 'engagement' ? 'participant engagement and interaction patterns' : 
                type === 'summary' ? 'key discussion points and outcomes' :
                type === 'suggestion' ? 'actionable recommendations for improvement' :
                'important alerts or concerns'}. Keep it concise and actionable (max 2 sentences).`

      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 100
      })

      const insight: AIInsight = {
        id: Date.now().toString(),
        type,
        title: type === 'engagement' ? '📊 Engagement Analysis' :
               type === 'summary' ? '📝 Discussion Summary' :
               type === 'suggestion' ? '💡 AI Suggestion' : '⚠️ Alert',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: type === 'alert' ? 'high' : type === 'suggestion' ? 'medium' : 'low'
      }

      setAiInsights(prev => [insight, ...prev.slice(0, 4)]) // Keep last 5 insights
    } catch (error) {
      console.error('Error generating AI insight:', error)
    }
  }

  const handleAIQuery = async () => {
    if (!aiQuery.trim() || isAiThinking) return
    
    setIsAiThinking(true)
    
    try {
      const context = `Meeting context: ${participants.length} participants, ${Math.floor(callAnalytics.duration / 60)} minutes duration, engagement score: ${callAnalytics.engagementScore}%`
      
      const { text } = await blink.ai.generateText({
        prompt: `As an AI teaching assistant in a video call, answer this question: "${aiQuery}". 
        Context: ${context}. Provide a helpful, educational response.`,
        maxTokens: 200
      })

      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        sender: 'AI Assistant',
        message: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: true
      }

      setChatMessages(prev => [...prev, aiResponse])
      setAiQuery('')
    } catch (error) {
      console.error('Error processing AI query:', error)
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        sender: 'AI Assistant',
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: true
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsAiThinking(false)
    }
  }

  const handleEndCall = () => {
    try {
      endCall()
    } catch (error) {
      console.error('Error ending call:', error)
    }
    // Always navigate back, even if there's an error
    navigate('/dashboard')
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setChatMessages(prev => [...prev, newMessage])
    setChatMessage('')
  }

  // Real-time analytics and AI insights
  useEffect(() => {
    // Update call analytics every 10 seconds
    analyticsInterval.current = setInterval(() => {
      const duration = Date.now() - callStartTime.current
      
      setCallAnalytics(prev => ({
        ...prev,
        duration,
        participantCount: participants.length,
        engagementScore: Math.max(60, Math.min(100, 85 + Math.random() * 10 - 5)) // Simulate dynamic engagement
      }))
    }, 10000)

    return () => {
      if (analyticsInterval.current) {
        clearInterval(analyticsInterval.current)
      }
    }
  }, [participants.length])

  // Generate AI insights periodically
  useEffect(() => {
    const insightInterval = setInterval(() => {
      const insights = [
        { type: 'engagement' as const, context: `${participants.length} participants with ${callAnalytics.engagementScore}% engagement` },
        { type: 'suggestion' as const, context: `Meeting duration: ${Math.floor(callAnalytics.duration / 60000)} minutes` },
        { type: 'summary' as const, context: 'Current discussion progress and key points' }
      ]
      
      const randomInsight = insights[Math.floor(Math.random() * insights.length)]
      generateAIInsight(randomInsight.type, randomInsight.context)
    }, 45000) // Generate insight every 45 seconds

    // Generate initial insight after 10 seconds
    setTimeout(() => {
      generateAIInsight('engagement', `Meeting started with ${participants.length} participants`)
    }, 10000)

    return () => clearInterval(insightInterval)
  }, [participants.length, callAnalytics.engagementScore, callAnalytics.duration])

  // Monitor participant changes for AI insights
  useEffect(() => {
    if (participants.length > callAnalytics.participantCount) {
      generateAIInsight('alert', `New participant joined - now ${participants.length} total participants`)
    }
  }, [participants.length, callAnalytics.participantCount])

  // Find current user and other participants
  const currentUser = participants.find(p => p.id === 'current-user')
  const otherParticipants = participants.filter(p => p.id !== 'current-user')

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-card to-card/95 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-lg">Meeting Room: {roomId}</h1>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {Math.floor(callAnalytics.duration / 60000)}:{String(Math.floor((callAnalytics.duration % 60000) / 1000)).padStart(2, '0')}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {participants.length} participants
            </span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {displayError && (
        <Alert className="m-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {displayError}
            {displayError.includes('permission') || displayError.includes('access') ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => window.location.reload()}
              >
                Refresh & Retry
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => setLocalError(null)}
              >
                Dismiss
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Status */}
      {!localStream && !displayError && (
        <Alert className="m-4 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            Requesting camera and microphone access... Please allow permissions when prompted.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Your Video (Local Stream) */}
              <div className="col-span-1 aspect-video">
                <VideoPlayer
                  stream={localStream}
                  name="You (Local)"
                  isMuted={isMuted}
                  isVideoOn={isVideoOn}
                  isLocal={true}
                  className="w-full h-full"
                />
              </div>

              {/* Main Speaker or Screen Share */}
              <div className="col-span-1 aspect-video">
                {isScreenSharing ? (
                  <VideoPlayer
                    stream={localStream}
                    name="Screen Share"
                    isMuted={isMuted}
                    isVideoOn={true}
                    className="w-full h-full"
                  />
                ) : otherParticipants.length > 0 ? (
                  <VideoPlayer
                    stream={otherParticipants[0].stream}
                    name={otherParticipants[0].name}
                    isMuted={otherParticipants[0].isMuted}
                    isVideoOn={otherParticipants[0].isVideoOn}
                    isHandRaised={otherParticipants[0].isHandRaised}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-900 rounded-lg flex items-center justify-center w-full h-full">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Waiting for participants...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Participants */}
              {otherParticipants.slice(1).map((participant) => (
                <div key={participant.id} className="aspect-video">
                  <VideoPlayer
                    stream={participant.stream}
                    name={participant.name}
                    isMuted={participant.isMuted}
                    isVideoOn={participant.isVideoOn}
                    isHandRaised={participant.isHandRaised}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-t bg-gradient-to-r from-card to-card/95">
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleMute}
                disabled={!localStream}
                className={`w-12 h-12 rounded-full transition-all ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={!isVideoOn ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                disabled={!localStream}
                className={`w-12 h-12 rounded-full transition-all ${
                  !isVideoOn 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="lg"
                onClick={toggleScreenShare}
                disabled={!localStream}
                className={`w-12 h-12 rounded-full transition-all ${
                  isScreenSharing 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowChat(!showChat)}
                className={`w-12 h-12 rounded-full transition-all ${
                  showChat 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowAI(!showAI)}
                className={`w-12 h-12 rounded-full transition-all ${
                  showAI 
                    ? 'bg-accent hover:bg-accent/90 text-white shadow-lg' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <Brain className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="w-12 h-12 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all"
              >
                <Hand className="h-5 w-5" />
              </Button>
              
              <div className="w-px h-8 bg-border mx-2"></div>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showAI) && (
          <div className="w-80 border-l bg-card">
            <Tabs value={showAI ? "ai" : "chat"} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="ai" onClick={() => setShowAI(true)}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI
                </TabsTrigger>
                <TabsTrigger value="chat" onClick={() => setShowChat(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="participants">
                  <Users className="h-4 w-4 mr-2" />
                  People
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="flex-1 flex flex-col m-4 mt-0">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <span>AI Teaching Assistant</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Activity className="h-3 w-3 mr-1" />
                        Analyzing
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Real-time Analytics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg text-center border border-primary/20">
                        <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <div className="text-lg font-semibold">
                          {Math.floor(callAnalytics.duration / 60000)}m
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-3 rounded-lg text-center border border-green-500/20">
                        <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <div className="text-lg font-semibold text-green-600">
                          {Math.round(callAnalytics.engagementScore)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-4 overflow-y-auto border">
                      <div className="space-y-3">
                        {aiInsights.length === 0 ? (
                          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                            <div className="flex items-center space-x-2 mb-2">
                              <Brain className="h-4 w-4 text-primary" />
                              <p className="text-sm font-medium">AI Assistant</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              I'm analyzing the conversation and will provide insights shortly...
                            </p>
                            <div className="flex items-center mt-3 text-xs text-muted-foreground">
                              <div className="animate-pulse w-2 h-2 bg-primary rounded-full mr-2"></div>
                              Processing meeting data
                            </div>
                          </div>
                        ) : (
                          aiInsights.map((insight) => (
                            <div 
                              key={insight.id} 
                              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${
                                insight.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-25 border-red-400' :
                                insight.priority === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-yellow-25 border-yellow-400' :
                                'bg-gradient-to-r from-blue-50 to-blue-25 border-blue-400'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm">{insight.title}</span>
                                <span className="text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded">{insight.timestamp}</span>
                              </div>
                              <p className="text-sm leading-relaxed">{insight.content}</p>
                            </div>
                          ))
                        )}
                        
                        <div className="bg-gradient-to-r from-green-50 to-green-25 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Activity className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm text-green-800">Live Status</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {participants.length} participants active • 
                            {currentUser && !currentUser.isMuted ? ' You are unmuted' : ' You are muted'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded-lg border">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Ask AI anything about the meeting..."
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                          className="flex-1 border-0 bg-transparent focus:ring-1 focus:ring-primary"
                          disabled={isAiThinking}
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAIQuery}
                          disabled={isAiThinking || !aiQuery.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isAiThinking ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Brain className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 flex flex-col m-4 mt-0">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle>Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    <ScrollArea className="flex-1">
                      <div className="space-y-3">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`p-3 rounded-lg transition-all ${
                            msg.isAI 
                              ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20' 
                              : 'bg-gradient-to-r from-slate-50 to-slate-100/50 border'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                {msg.isAI && <Brain className="h-3 w-3 text-primary" />}
                                <span className="font-medium text-sm">{msg.sender}</span>
                              </div>
                              <span className="text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded">{msg.timestamp}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="bg-white/50 p-3 rounded-lg border">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 border-0 bg-transparent focus:ring-1 focus:ring-primary"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          size="sm"
                          disabled={!chatMessage.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants" className="flex-1 flex flex-col m-4 mt-0">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Participants ({participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 border hover:shadow-sm transition-all">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                              <span className="text-sm font-semibold text-primary">
                                {participant.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">{participant.name}</span>
                              {participant.id === 'current-user' && (
                                <span className="text-xs text-muted-foreground block">(You)</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {participant.isHandRaised && (
                              <div className="p-1 bg-yellow-100 rounded-full">
                                <Hand className="h-3 w-3 text-yellow-600" />
                              </div>
                            )}
                            <div className={`p-1 rounded-full ${
                              participant.isMuted ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {participant.isMuted ? (
                                <MicOff className="h-3 w-3 text-red-600" />
                              ) : (
                                <Mic className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <div className={`p-1 rounded-full ${
                              participant.isVideoOn ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {participant.isVideoOn ? (
                                <Video className="h-3 w-3 text-green-600" />
                              ) : (
                                <VideoOff className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}