import React, { useState } from 'react';
import { Bell, X, Check, Trash2, CheckCircle, XCircle, AlertTriangle, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [version] = useState(() => Date.now()); // Force re-render
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'error':
        return <XCircle size={14} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={14} className="text-yellow-600" />;
      case 'info':
        return <Info size={14} className="text-blue-600" />;
      default:
        return <Bell size={14} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50/50 hover:bg-green-50';
      case 'error':
        return 'border-l-4 border-l-red-500 bg-red-50/50 hover:bg-red-50';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50/50 hover:bg-yellow-50';
      case 'info':
        return 'border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50/50 hover:bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200",
          isOpen 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Bell size={18} className="transition-transform duration-200" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel - Updated Design */}
          <Card 
            className="absolute -right-20 top-16 w-72 z-50 shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modern Top Bar Design */}
            <div className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200/60">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Bell size={20} className="text-white" />
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Notifications
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">Stay updated with real-time alerts</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    
                     
                    {unreadCount > 0 && (
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                        <span className="text-sm font-semibold text-blue-700">{unreadCount} unread</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 md:space-x-2 flex-wrap gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-8 px-2 md:px-3 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <Check size={14} className="mr-1" />
                        <span className="hidden sm:inline">Mark all read</span>
                        <span className="sm:hidden">Mark</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="h-8 px-2 md:px-3 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      <Trash2 size={14} className="mr-1" />
                      <span className="hidden sm:inline">Clear all</span>
                      <span className="sm:hidden">Clear</span>
                    </Button>
                    
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Search notifications..." 
                    className="pl-10 pr-4 h-10 w-full"
                  />
                </div>
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-lg">
                      <Bell size={32} className="text-blue-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">All caught up!</h4>
                  <p className="text-sm text-gray-500 mb-4">No new notifications at the moment</p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">Live monitoring active</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'group p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md',
                            getNotificationColor(notification.type),
                            !notification.read && 'ring-2 ring-primary/20 shadow-sm'
                          )}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                  <h4 className={cn(
                                    'text-sm font-medium text-gray-900 mb-1',
                                    !notification.read && 'font-semibold'
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                    {notification.message}
                                  </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-red-100 hover:text-red-600"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

