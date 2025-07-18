import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Video, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  Clock, 
  Play,
  Brain,
  FileText,
  Mic,
  Camera,
  Share2,
  MessageSquare,
  TrendingUp,
  Award,
  BookOpen,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { blink } from '../blink/client'

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  participants: number
  status: 'upcoming' | 'live' | 'completed'
  aiInsights?: {
    engagement: number
    participation: number
    comprehension: number
  }
}

interface AnalyticsData {
  totalMeetings: number
  totalParticipants: number
  avgEngagement: number
  aiInteractions: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMeetings: 15,
    totalParticipants: 187,
    avgEngagement: 89,
    aiInteractions: 312
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)

        // Load sample meetings data (database not available in demo)
        const sampleMeetings: Meeting[] = [
          {
            id: 'sample-1',
            title: 'Advanced React Patterns Workshop',
            date: '2024-01-17',
            time: '2:00 PM',
            participants: 24,
            status: 'completed',
            aiInsights: {
              engagement: 92,
              participation: 88,
              comprehension: 85
            }
          },
          {
            id: 'sample-2',
            title: 'Team Standup Meeting',
            date: '2024-01-16',
            time: '9:00 AM',
            participants: 8,
            status: 'completed',
            aiInsights: {
              engagement: 78,
              participation: 95,
              comprehension: 82
            }
          },
          {
            id: 'sample-3',
            title: 'Product Strategy Review',
            date: '2024-01-18',
            time: '3:30 PM',
            participants: 12,
            status: 'upcoming'
          },
          {
            id: 'sample-4',
            title: 'AI Integration Workshop',
            date: '2024-01-19',
            time: '10:00 AM',
            participants: 18,
            status: 'upcoming'
          },
          {
            id: 'sample-5',
            title: 'Weekly Design Review',
            date: '2024-01-15',
            time: '4:00 PM',
            participants: 6,
            status: 'completed',
            aiInsights: {
              engagement: 85,
              participation: 92,
              comprehension: 88
            }
          }
        ]
        setMeetings(sampleMeetings)

        // Use enhanced analytics data for demo
        setAnalytics({
          totalMeetings: 15,
          totalParticipants: 187,
          avgEngagement: 89,
          aiInteractions: 312
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleStartMeeting = () => {
    const roomId = `room_${Date.now()}`
    navigate(`/call/${roomId}`)
  }

  const handleJoinMeeting = () => {
    navigate('/join')
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">AI Video Platform</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-primary" />
                <span>Start New Meeting</span>
              </CardTitle>
              <CardDescription>
                Create an instant meeting with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStartMeeting} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Meeting
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Join Meeting</span>
              </CardTitle>
              <CardDescription>
                Enter a meeting ID to join an existing session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleJoinMeeting} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgEngagement}%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.aiInteractions}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="meetings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="meetings">Recent Meetings</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="features">Platform Features</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Meetings</CardTitle>
                <CardDescription>
                  Your latest video conferences with AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meetings.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No meetings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your first AI-enhanced video meeting
                    </p>
                    <Button onClick={handleStartMeeting}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Meeting
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Video className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{meeting.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {meeting.date} at {meeting.time} • {meeting.participants} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={meeting.status === 'live' ? 'default' : 'secondary'}>
                            {meeting.status}
                          </Badge>
                          {meeting.aiInsights && (
                            <div className="text-sm text-muted-foreground">
                              Engagement: {meeting.aiInsights.engagement}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Analytics</CardTitle>
                  <CardDescription>
                    AI-powered participant engagement tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Participation</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Question Engagement</span>
                      <span>72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>AI Assistant Usage</span>
                      <span>91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Outcomes</CardTitle>
                  <CardDescription>
                    AI analysis of educational effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Comprehension Rate</span>
                    </div>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Knowledge Retention</span>
                    </div>
                    <span className="font-medium">76%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Improvement Score</span>
                    </div>
                    <span className="font-medium">+15%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>AI Teaching Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Real-time Q&A support</li>
                    <li>• Automated transcription</li>
                    <li>• Smart content suggestions</li>
                    <li>• Voice interaction</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Analytics & Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Engagement tracking</li>
                    <li>• Participation metrics</li>
                    <li>• Learning outcomes</li>
                    <li>• Performance reports</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Interactive Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Live polls & quizzes</li>
                    <li>• Interactive whiteboard</li>
                    <li>• Breakout rooms</li>
                    <li>• Screen annotations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-blue-500" />
                    <span>Video Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• HD video quality</li>
                    <li>• Screen sharing</li>
                    <li>• Recording with highlights</li>
                    <li>• Virtual backgrounds</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <span>Communication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Real-time chat</li>
                    <li>• Hand raise system</li>
                    <li>• Private messaging</li>
                    <li>• Emoji reactions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span>Documentation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Meeting summaries</li>
                    <li>• Action items</li>
                    <li>• Attendance tracking</li>
                    <li>• Export reports</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Intelligent analysis and recommendations for your meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Engagement Recommendation</h4>
                    <p className="text-sm text-blue-700">
                      Consider adding more interactive polls during the first 15 minutes to boost early engagement by an estimated 23%.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Optimal Meeting Length</h4>
                    <p className="text-sm text-green-700">
                      Based on attention patterns, your meetings perform best at 45-50 minutes with a 5-minute break.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">AI Assistant Usage</h4>
                    <p className="text-sm text-purple-700">
                      Participants who interact with the AI assistant show 31% better comprehension rates. Encourage more AI interactions.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2">Content Difficulty</h4>
                    <p className="text-sm text-orange-700">
                      AI analysis suggests breaking down complex topics into 3-5 minute segments for better retention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}