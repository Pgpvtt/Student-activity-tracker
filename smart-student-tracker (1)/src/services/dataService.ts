import { db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';

export interface UserData {
  userId: string;
  email: string;
  plan: string;
  subjects: any[];
  timetable: any[];
  assignments: any[];
  faculty: any[];
  practicals: any[];
  settings: any;
  timetableMetadata: any;
  streak: number;
  bestStreak: number;
  notifications: any[];
  assistantChat: any[];
  planUpgradeDate?: string;
  groups?: string[];
  name?: string;
}

export interface GroupData {
  groupId: string;
  groupName: string;
  adminId: string;
  members: { userId: string; name: string }[];
  sharedAssignments: any[];
  sharedAnnouncements: any[];
}

const DEFAULT_USER_DATA: Omit<UserData, 'userId' | 'email'> = {
  plan: 'free',
  subjects: [],
  timetable: [],
  assignments: [],
  faculty: [],
  practicals: [],
  settings: {},
  timetableMetadata: {},
  streak: 0,
  bestStreak: 0,
  notifications: [],
  assistantChat: [],
  planUpgradeDate: '',
  groups: []
};

/**
 * Centered data service for academic data management.
 * Integrated with Firebase Firestore.
 */
export const dataService = {
  /**
   * AUTH HELPERS
   */
  initUser: async (userId: string, data: Partial<UserData>) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...DEFAULT_USER_DATA,
      ...data,
      userId,
      createdAt: new Date().toISOString()
    });
  },

  getFullUserData: async (userId: string): Promise<UserData | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return null;
      
      const basicData = userSnap.data() as UserData;
      
      // Fetch subcollections concurrently
      const [subjects, timetable, assignments, notifications, faculty, practicals] = await Promise.all([
        dataService.getSubcollection(userId, 'subjects'),
        dataService.getSubcollection(userId, 'timetable'),
        dataService.getSubcollection(userId, 'assignments'),
        dataService.getSubcollection(userId, 'notifications'),
        dataService.getSubcollection(userId, 'faculty'),
        dataService.getSubcollection(userId, 'practicals'),
      ]);

      return {
        ...basicData,
        subjects,
        timetable,
        assignments,
        notifications,
        faculty,
        practicals
      };
    } catch (error) {
      console.error("Error fetching full user data:", error);
      // Fallback to local storage if needed (optional optimization)
      return null;
    }
  },

  getSubcollection: async (userId: string, subName: string) => {
    const colRef = collection(db, 'users', userId, subName);
    const snap = await getDocs(colRef);
    return snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
  },

  /**
   * GROUP METHODS
   */
  getGroup: async (groupId: string): Promise<GroupData | null> => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const snap = await getDoc(groupRef);
      return snap.exists() ? (snap.data() as GroupData) : null;
    } catch (error) {
      return null;
    }
  },

  saveGroup: async (groupId: string, data: GroupData) => {
    const groupRef = doc(db, 'groups', groupId);
    await setDoc(groupRef, data);
    return data;
  },

  deleteGroup: async (groupId: string) => {
    const groupRef = doc(db, 'groups', groupId);
    await deleteDoc(groupRef);
  },

  /**
   * USER DATA METHODS (Legacy sync signatures kept where possible, but async)
   */
  getUserData: async (userId: string): Promise<UserData> => {
    const data = await dataService.getFullUserData(userId);
    return data || { userId, email: '', ...DEFAULT_USER_DATA };
  },

  saveUserData: async (userId: string, data: Partial<UserData>) => {
    try {
      const userRef = doc(db, 'users', userId);
      const subcollections = ['subjects', 'timetable', 'assignments', 'notifications', 'faculty', 'practicals'];
      
      const basicFields: any = {};
      const subcollectionWrites: Promise<any>[] = [];
      
      Object.entries(data).forEach(([key, value]) => {
        if (subcollections.includes(key)) {
          subcollectionWrites.push(dataService.updateSection(userId, key as keyof UserData, value));
        } else {
          basicFields[key] = value;
        }
      });
      
      if (Object.keys(basicFields).length > 0) {
        await setDoc(userRef, basicFields, { merge: true });
      }
      
      await Promise.all(subcollectionWrites);
      return data as UserData;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  updateSection: async (userId: string, section: keyof UserData, value: any) => {
    try {
      const subcollections = ['subjects', 'timetable', 'assignments', 'notifications', 'faculty', 'practicals'];
      if (subcollections.includes(section as string) && Array.isArray(value)) {
        // For subcollections, we need to sync the individual documents
        // To be safe and follow the requirement, we'll use a batch to update them
        // Note: For large arrays, this should be optimized, but for a student tracker, it's usually small
        
        const batch = writeBatch(db);
        
        // 1. Get existing docs in subcollection to delete them (simplest sync for whole-array update)
        const colRef = collection(db, 'users', userId, section as string);
        const existingSnap = await getDocs(colRef);
        existingSnap.docs.forEach(doc => batch.delete(doc.ref));
        
        // 2. Add new docs
        value.forEach(item => {
          const id = item._id || item.id || Date.now().toString() + Math.random().toString(36).substr(2, 4);
          const docRef = doc(db, 'users', userId, section as string, id);
          batch.set(docRef, { ...item, _id: id });
        });
        
        await batch.commit();
      } else {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { [section]: value }, { merge: true });
      }
    } catch (error) {
      console.error(`Error updating section ${section}:`, error);
      throw error;
    }
  },

  setUserData: async (userId: string, data: Partial<UserData>) => {
    return await dataService.saveUserData(userId, data);
  },

  clearUserData: async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  },

  getCollection: async (userId: string, section: keyof UserData): Promise<any[]> => {
    return dataService.getSubcollection(userId, section as string);
  },

  // Specific Subcollection Helpers
  addToSubcollection: async (userId: string, colName: string, data: any) => {
    const id = data._id || data.id || Date.now().toString();
    const docRef = doc(db, 'users', userId, colName, id);
    await setDoc(docRef, { ...data, _id: id });
    return id;
  },

  removeFromSubcollection: async (userId: string, colName: string, docId: string) => {
    const docRef = doc(db, 'users', userId, colName, docId);
    await deleteDoc(docRef);
  }
};
