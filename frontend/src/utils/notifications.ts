// Global notification system for super alert boxes
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  message: string;
  type: NotificationType;
  details?: string;
  duration?: number;
}

export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  show(options: NotificationOptions): void {
    const { message, type, details, duration = 8000 } = options;

    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-red-600';
    const icon = type === 'success'
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
      : type === 'warning'
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';

    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md`;
    notification.innerHTML = `
      <div class="flex items-start">
        <svg class="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icon}
        </svg>
        <div class="flex-1">
          <div class="font-semibold text-sm">${message}</div>
          ${details ? `<div class="text-xs mt-2 opacity-90 whitespace-pre-line">${details}</div>` : ''}
          <div class="text-xs mt-2 opacity-75">${new Date().toLocaleTimeString('fr-FR')}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animation d'entrée
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto-suppression après la durée spécifiée
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  success(message: string, details?: string): void {
    this.show({ message, type: 'success', details });
  }

  error(message: string, details?: string): void {
    this.show({ message, type: 'error', details });
  }

  warning(message: string, details?: string): void {
    this.show({ message, type: 'warning', details });
  }

  info(message: string, details?: string): void {
    this.show({ message, type: 'info', details });
  }
}

// Export singleton instance
export const notifications = NotificationManager.getInstance();

// Legacy alert replacement function for easy migration
export const showNotification = notifications.show.bind(notifications);