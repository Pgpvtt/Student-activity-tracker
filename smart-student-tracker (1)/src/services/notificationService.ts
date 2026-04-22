import { dataService, UserData } from './dataService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'assignment' | 'timetable';
  date: string;
  read: boolean;
}

export const notificationService = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    return await dataService.getCollection(userId, 'notifications');
  },

  addNotification: async (userId: string, notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const notifications = await dataService.getCollection(userId, 'notifications');
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false
    };
    
    // Prevent duplicate notifications with same title, message and type within a certain timeframe (e.g., same day)
    const today = new Date().toISOString().split('T')[0];
    const exists = notifications.find(n => 
      n.title === notification.title && 
      n.message === notification.message &&
      n.type === notification.type && 
      n.date.startsWith(today)
    );

    if (!exists) {
      await dataService.setUserData(userId, { notifications: [newNotification, ...notifications] });
    }
  },

  markAsRead: async (userId: string, notificationId: string) => {
    const notifications = await dataService.getCollection(userId, 'notifications');
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    await dataService.setUserData(userId, { notifications: updated });
  },

  markAllAsRead: async (userId: string) => {
    const notifications = await dataService.getCollection(userId, 'notifications');
    const updated = notifications.map(n => ({ ...n, read: true }));
    await dataService.setUserData(userId, { notifications: updated });
  },

  generateAutoNotifications: async (userId: string) => {
    const data = await dataService.getUserData(userId);
    
    // 1. Attendance Alerts
    const subjects = data.subjects || [];
    for (const subject of subjects) {
      const total = subject.totalClasses || 0;
      const attended = subject.attendedClasses || 0;
      const percentage = (attended / (total || 1)) * 100;
      if (percentage < 75 && total > 0) {
        await notificationService.addNotification(userId, {
          title: 'Low Attendance Alert',
          message: `Your attendance in ${subject.subjectName} is below 75% (${percentage.toFixed(1)}%)`,
          type: 'attendance'
        });
      }
    }

    // 2. Assignment Alerts
    const today = new Date();
    const assignments = data.assignments || [];
    for (const assignment of assignments) {
      if (assignment.status === 'completed') continue;
      
      const deadline = new Date(assignment.deadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        await notificationService.addNotification(userId, {
          title: 'Assignment Overdue',
          message: `Assignment overdue: ${assignment.title}`,
          type: 'assignment'
        });
      } else if (diffDays <= 2) {
        await notificationService.addNotification(userId, {
          title: 'Assignment Due Soon',
          message: `Assignment due in ${diffDays} day(s): ${assignment.title}`,
          type: 'assignment'
        });
      }
    }

    // 3. Daily Timetable Reminder
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()].toLowerCase();
    const timetable = data.timetable || [];
    const classesToday = timetable.filter(t => t.day.toLowerCase() === currentDay);
    
    if (classesToday.length > 0) {
      await notificationService.addNotification(userId, {
        title: 'Daily Schedule',
        message: `You have ${classesToday.length} classes scheduled for today (${dayNames[today.getDay()]})`,
        type: 'timetable'
      });
    }
  }
};
