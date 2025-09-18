import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Copy, 
  Download, 
  Trash2, 
  Link, 
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Alert types configuration
const alertConfig = {
  success: {
    icon: CheckCircle,
    className: "border-none bg-black text-white",
    iconColor: "text-white"
  },
  error: {
    icon: XCircle,
    className: "border-red-500/20 bg-red-500/10 text-red-400",
    iconColor: "text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-none bg-black text-white",
    iconColor: "text-white"
  },
  info: {
    icon: Info,
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    iconColor: "text-blue-400"
  }
};

// Predefined alert messages for common actions
const alertMessages = {
  copySuccess: {
    type: 'success',
    title: 'Link Copied!',
    description: 'The shortened URL has been copied to your clipboard.',
    icon: Copy
  },
  copyError: {
    type: 'error',
    title: 'Copy Failed',
    description: 'Unable to copy link to clipboard. Please try again.',
    icon: Copy
  },
  downloadSuccess: {
    type: 'success',
    title: 'Download Started',
    description: 'Your QR code is being downloaded.',
    icon: Download
  },
  downloadError: {
    type: 'error',
    title: 'Download Failed',
    description: 'Unable to download the QR code. Please try again.',
    icon: Download
  },
  deleteSuccess: {
    type: 'success',
    title: 'Link Deleted',
    description: 'The shortened URL has been permanently deleted.',
    icon: Trash2
  },
  deleteError: {
    type: 'error',
    title: 'Delete Failed',
    description: 'Unable to delete the link. Please try again.',
    icon: Trash2
  },
  linkCreated: {
    type: 'success',
    title: 'Link Created!',
    description: 'Your new shortened URL is ready to use.',
    icon: Link
  },
  linkError: {
    type: 'error',
    title: 'Creation Failed',
    description: 'Unable to create shortened link. Please check the URL and try again.',
    icon: Link
  },
  unauthorizedAccess: {
    type: 'warning',
    title: 'Access Denied',
    description: 'You do not have permission to access this link.',
    icon: AlertCircle
  },
  networkError: {
    type: 'error',
    title: 'Network Error',
    description: 'Unable to connect to the server. Please check your connection.',
    icon: AlertCircle
  },
  validationError: {
    type: 'warning',
    title: 'Invalid Input',
    description: 'Please enter a valid URL before proceeding.',
    icon: AlertTriangle
  }
};

// Individual Alert Component
const NotificationAlert = ({ 
  type = 'info', 
  title, 
  description, 
  icon: CustomIcon,
  onClose,
  autoClose = true,
  duration = 4000,
  className = ""
}) => {
  const [visible, setVisible] = useState(true);
  const config = alertConfig[type];
  const Icon = CustomIcon || config.icon;

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <Alert className={`${config.className} ${className} relative animate-in slide-in-from-top-2 duration-300`}>
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <div className="flex-1">
        <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
        <AlertDescription className="text-sm opacity-90">
          {description}
        </AlertDescription>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-70 hover:opacity-100"
          onClick={handleClose}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};

// Alert Manager Hook
const useAlertManager = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (alertKey, customProps = {}) => {
    const alertData = alertMessages[alertKey];
    if (!alertData) {
      console.warn(`Alert key "${alertKey}" not found`);
      return;
    }

    const newAlert = {
      id: Date.now() + Math.random(),
      ...alertData,
      ...customProps
    };

    setAlerts(prev => [...prev, newAlert]);
  };

  const showCustomAlert = (alertProps) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      ...alertProps
    };

    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    showAlert,
    showCustomAlert,
    removeAlert,
    clearAllAlerts
  };
};

// Alert Container Component
const AlertContainer = ({ alerts, onRemoveAlert, position = "top-right" }) => {
  const positionClasses = {
    "top-right": "fixed top-4 right-18 z-50",
    "top-left": "fixed top-4 left-4 z-50",
    "bottom-right": "fixed bottom-4 right-4 z-50",
    "bottom-left": "fixed bottom-4 left-4 z-50",
    "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
    "bottom-center": "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
  };

  return (
    <div className={`${positionClasses[position]} space-y-2 max-w-md w-full`}>
      {alerts.map((alert) => (
        <NotificationAlert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          description={alert.description}
          icon={alert.icon}
          onClose={() => onRemoveAlert(alert.id)}
          autoClose={alert.autoClose !== false}
          duration={alert.duration || 4000}
        />
      ))}
    </div>
  );
};

// Demo Component showing usage examples
const AlertDemo = () => {
  const { alerts, showAlert, showCustomAlert, removeAlert, clearAllAlerts } = useAlertManager();

  const handleCopyLink = () => {
    // Simulate copy action
    navigator.clipboard.writeText('https://zhourt.gt.tc/abc123')
      .then(() => showAlert('copySuccess'))
      .catch(() => showAlert('copyError'));
  };

  const handleDownload = () => {
    // Simulate download
    const success = Math.random() > 0.3; // 70% success rate for demo
    if (success) {
      showAlert('downloadSuccess');
    } else {
      showAlert('downloadError');
    }
  };

  const handleDelete = () => {
    // Simulate delete with confirmation
    showCustomAlert({
      type: 'warning',
      title: 'Confirm Deletion',
      description: 'This action cannot be undone. Are you sure?',
      icon: Trash2,
      autoClose: false,
      duration: 0
    });

    setTimeout(() => {
      showAlert('deleteSuccess');
    }, 2000);
  };

  const handleCreateLink = () => {
    const success = Math.random() > 0.2; // 80% success rate
    if (success) {
      showAlert('linkCreated');
    } else {
      showAlert('linkError');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Alert Notifications Demo
          </h1>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button onClick={handleCopyLink} className="bg-blue-600 hover:bg-blue-700">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Link
            </Button>
            <Button onClick={handleCreateLink} className="bg-purple-600 hover:bg-purple-700">
              <Link className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          </div>

          {/* Additional Alert Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button 
              onClick={() => showAlert('unauthorizedAccess')} 
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              Show Warning
            </Button>
            <Button 
              onClick={() => showAlert('networkError')} 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Show Network Error
            </Button>
            <Button 
              onClick={() => showAlert('validationError')} 
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
            >
              Show Validation Error
            </Button>
          </div>

          {/* Custom Alert Example */}
          <div className="text-center mb-8">
            <Button 
              onClick={() => showCustomAlert({
                type: 'info',
                title: 'Custom Alert',
                description: 'This is a custom alert message with custom properties!',
                icon: Info,
                duration: 6000
              })}
              variant="secondary"
            >
              Show Custom Alert
            </Button>
          </div>

          {/* Clear All Button */}
          {alerts.length > 0 && (
            <div className="text-center">
              <Button onClick={clearAllAlerts} variant="destructive">
                Clear All Alerts ({alerts.length})
              </Button>
            </div>
          )}

          {/* Static Alert Examples */}
          <div className="space-y-4 mt-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Static Alert Examples</h2>
            
            <NotificationAlert
              type="success"
              title="Success Alert"
              description="This is a success message example."
              autoClose={false}
            />
            
            <NotificationAlert
              type="error"
              title="Error Alert"
              description="This is an error message example."
              autoClose={false}
            />
            
            <NotificationAlert
              type="warning"
              title="Warning Alert"
              description="This is a warning message example."
              autoClose={false}
            />
            
            <NotificationAlert
              type="info"
              title="Info Alert"
              description="This is an informational message example."
              autoClose={false}
            />
          </div>
        </div>
      </div>

      {/* Alert Container */}
      <AlertContainer 
        alerts={alerts} 
        onRemoveAlert={removeAlert}
        position="top-right"
      />
    </div>
  );
};

// Export all components and utilities
export {
  NotificationAlert,
  AlertContainer,
  useAlertManager,
  alertMessages,
  AlertDemo
};

export default AlertDemo;