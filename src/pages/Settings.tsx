import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Bell, Video, Mic, Shield, Brain, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Separator } from '../components/ui/separator'

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    notifications: {
      meetingReminders: true,
      aiInsights: true,
      chatMessages: false,
      emailReports: true
    },
    video: {
      quality: 'hd',
      autoJoinVideo: true,
      virtualBackground: false,
      mirrorVideo: true
    },
    audio: {
      autoJoinMuted: false,
      noiseCancellation: true,
      echoCancellation: true,
      microphoneGain: 50
    },
    ai: {
      enableAssistant: true,
      autoTranscription: true,
      smartSuggestions: true,
      engagementTracking: true,
      voiceInteraction: false
    },
    privacy: {
      recordingConsent: true,
      dataSharing: false,
      analyticsOptOut: false
    }
  })

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings)
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your AI video platform experience
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Mic className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => updateSetting('', 'displayName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('', 'email', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Meeting Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified before scheduled meetings
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.meetingReminders}
                    onCheckedChange={(checked) => updateSetting('notifications', 'meetingReminders', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive AI-generated meeting insights and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.aiInsights}
                    onCheckedChange={(checked) => updateSetting('notifications', 'aiInsights', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chat Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new chat messages during meetings
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.chatMessages}
                    onCheckedChange={(checked) => updateSetting('notifications', 'chatMessages', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly email reports with meeting analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailReports}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Settings</CardTitle>
                <CardDescription>
                  Configure your video preferences and quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Video Quality</Label>
                  <Select
                    value={settings.video.quality}
                    onValueChange={(value) => updateSetting('video', 'quality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">Standard Definition (480p)</SelectItem>
                      <SelectItem value="hd">High Definition (720p)</SelectItem>
                      <SelectItem value="fhd">Full HD (1080p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-join with Video</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically turn on camera when joining meetings
                    </p>
                  </div>
                  <Switch
                    checked={settings.video.autoJoinVideo}
                    onCheckedChange={(checked) => updateSetting('video', 'autoJoinVideo', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Virtual Background</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable virtual background by default
                    </p>
                  </div>
                  <Switch
                    checked={settings.video.virtualBackground}
                    onCheckedChange={(checked) => updateSetting('video', 'virtualBackground', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mirror Video</Label>
                    <p className="text-sm text-muted-foreground">
                      Mirror your video feed (like looking in a mirror)
                    </p>
                  </div>
                  <Switch
                    checked={settings.video.mirrorVideo}
                    onCheckedChange={(checked) => updateSetting('video', 'mirrorVideo', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>
                  Configure your audio preferences and enhancements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-join Muted</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mute microphone when joining meetings
                    </p>
                  </div>
                  <Switch
                    checked={settings.audio.autoJoinMuted}
                    onCheckedChange={(checked) => updateSetting('audio', 'autoJoinMuted', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Noise Cancellation</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce background noise during calls
                    </p>
                  </div>
                  <Switch
                    checked={settings.audio.noiseCancellation}
                    onCheckedChange={(checked) => updateSetting('audio', 'noiseCancellation', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Echo Cancellation</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent audio feedback and echo
                    </p>
                  </div>
                  <Switch
                    checked={settings.audio.echoCancellation}
                    onCheckedChange={(checked) => updateSetting('audio', 'echoCancellation', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Settings</CardTitle>
                <CardDescription>
                  Configure your AI teaching assistant preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Assistant</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on the AI teaching assistant for meetings
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.enableAssistant}
                    onCheckedChange={(checked) => updateSetting('ai', 'enableAssistant', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Transcription</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically transcribe meeting conversations
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.autoTranscription}
                    onCheckedChange={(checked) => updateSetting('ai', 'autoTranscription', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smart Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered content and interaction suggestions
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.smartSuggestions}
                    onCheckedChange={(checked) => updateSetting('ai', 'smartSuggestions', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Engagement Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor participant engagement with AI analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.engagementTracking}
                    onCheckedChange={(checked) => updateSetting('ai', 'engagementTracking', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Voice Interaction</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable voice commands for AI assistant
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai.voiceInteraction}
                    onCheckedChange={(checked) => updateSetting('ai', 'voiceInteraction', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your privacy settings and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recording Consent</Label>
                    <p className="text-sm text-muted-foreground">
                      Require explicit consent before recording meetings
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.recordingConsent}
                    onCheckedChange={(checked) => updateSetting('privacy', 'recordingConsent', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow sharing anonymized data for platform improvement
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Opt-out</Label>
                    <p className="text-sm text-muted-foreground">
                      Opt out of usage analytics and tracking
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.analyticsOptOut}
                    onCheckedChange={(checked) => updateSetting('privacy', 'analyticsOptOut', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}