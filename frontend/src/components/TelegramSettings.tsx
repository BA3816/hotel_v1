import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bot, Send, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../api/axios';

interface TelegramStatus {
  configured: boolean;
  enabled: boolean;
  bot_token_set: boolean;
  chat_id_set: boolean;
}

const TelegramSettings: React.FC = () => {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    bot_token: '',
    chat_id: '',
    enabled: false,
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/telegram/status');
      if (response.data.success) {
        setStatus(response.data.data);
        setSettings({
          bot_token: response.data.data.bot_token_set ? '••••••••••••••••' : '',
          chat_id: response.data.data.chat_id_set ? '••••••••••••••••' : '',
          enabled: response.data.data.enabled,
        });
      }
    } catch (error) {
      console.error('Failed to fetch Telegram status:', error);
      toast.error('Failed to load Telegram settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Don't send masked values - only send if they're new
      const settingsToSave: any = {
        enabled: settings.enabled
      };
      
      if (settings.bot_token && settings.bot_token !== '••••••••••••••••') {
        settingsToSave.bot_token = settings.bot_token;
      }
      
      if (settings.chat_id && settings.chat_id !== '••••••••••••••••') {
        settingsToSave.chat_id = settings.chat_id;
      }
      
      const response = await axiosClient.post('/api/telegram/settings', settingsToSave);
      if (response.data.success) {
        toast.success('Telegram settings saved successfully!');
        fetchStatus();
      } else {
        toast.error(response.data.message || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save Telegram settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const response = await axiosClient.post('/api/telegram/test');
      if (response.data.success) {
        toast.success('Test message sent successfully! Check your Telegram.');
      } else {
        toast.error(response.data.message || 'Failed to send test message');
      }
    } catch (error: any) {
      console.error('Failed to send test message:', error);
      toast.error(error.response?.data?.message || 'Failed to send test message');
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;
    
    if (status.configured && status.enabled) {
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
    } else if (status.configured && !status.enabled) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Configured (Disabled)</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Telegram Notifications
          </CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Telegram Notifications
            </CardTitle>
            <CardDescription>
              Get instant notifications for new booking requests
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Message <code className="bg-blue-100 px-1 rounded">@BotFather</code> on Telegram</li>
            <li>Create a new bot with <code className="bg-blue-100 px-1 rounded">/newbot</code></li>
            <li>Get your bot token and paste it below</li>
            <li>Start a chat with your bot and send any message</li>
            <li>Get your chat ID from <code className="bg-blue-100 px-1 rounded">@userinfobot</code></li>
            <li>Enable notifications and test!</li>
          </ol>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Settings Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Telegram Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications to your Telegram when new bookings are created
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked: boolean) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bot_token">Bot Token</Label>
            <Input
              id="bot_token"
              type="password"
              placeholder="Enter your bot token (e.g., 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
              value={settings.bot_token}
              onChange={(e) => setSettings(prev => ({ ...prev, bot_token: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Get this from @BotFather when you create your bot
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chat_id">Chat ID</Label>
            <Input
              id="chat_id"
              type="text"
              placeholder="Enter your chat ID (e.g., 123456789)"
              value={settings.chat_id}
              onChange={(e) => setSettings(prev => ({ ...prev, chat_id: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Get this from @userinfobot or by sending a message to your bot
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testing || !status?.configured}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {testing ? 'Sending...' : 'Send Test Message'}
          </Button>
        </div>

        {/* Status Information */}
        {status && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Configuration Status:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {status.bot_token_set ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span>Bot Token</span>
              </div>
              <div className="flex items-center gap-2">
                {status.chat_id_set ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span>Chat ID</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramSettings;
