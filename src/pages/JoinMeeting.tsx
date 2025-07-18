import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Video, Users, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function JoinMeeting() {
  const navigate = useNavigate()
  const [meetingId, setMeetingId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoinMeeting = async () => {
    if (!meetingId.trim() || !displayName.trim()) return
    
    setLoading(true)
    // Simulate joining process
    setTimeout(() => {
      navigate(`/call/${meetingId}`)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Meeting</CardTitle>
            <CardDescription>
              Enter the meeting ID to join an AI-enhanced video conference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input
                id="meetingId"
                placeholder="Enter meeting ID (e.g., 123-456-789)"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleJoinMeeting}
              disabled={!meetingId.trim() || !displayName.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Video className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Joining...' : 'Join Meeting'}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-sm">HD Video</h4>
                <p className="text-xs text-muted-foreground">Crystal clear video quality</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">AI Assistant</h4>
                <p className="text-xs text-muted-foreground">Smart teaching support</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Secure</h4>
                <p className="text-xs text-muted-foreground">End-to-end encryption</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}