import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { auth } from '../config/firebase';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ========== Type Definitions ==========

export interface User {
  uid: string;
  email: string;
  role: 'elder' | 'caregiver';
  firstName: string;
  lastName: string;
  tel: string | null;
  photoURL: string | null;
  authProvider: 'email' | 'google';
  status: 'online' | 'offline' | 'busy';
  lastSeen: FirebaseFirestoreTypes.Timestamp;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  isActive: boolean;
}

export interface Elder {
  userId: string;
  height: number;
  weight: number;
  age: number;
  medicalHistory: string;
  bloodType: string | null;
  allergies: string[] | null;
  medications: string[] | null;
  emergencyContactName: string | null;
  emergencyContactTel: string | null;
  emergencyContactRelation: string | null;
  backgroundImageURL: string | null;
  currentHealthStatus: {
    risk: 'Normal' | 'Warning' | 'Danger';
    heartRate: number;
    spO2: number;
    gyroscope: 'Normal' | 'Fell';
    lastUpdated: FirebaseFirestoreTypes.Timestamp;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    lastUpdated: FirebaseFirestoreTypes.Timestamp;
  } | null;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Caregiver {
  userId: string;
  specialization: string | null;
  experience: number | null;
  certification: string[] | null;
  totalEldersCared: number;
  backgroundImageURL: string | null;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Relationship {
  caregiverId: string;
  elderId: string;
  relationshipType: 'family' | 'professional' | 'volunteer';
  status: 'pending' | 'active' | 'inactive';
  canViewHealth: boolean;
  canEditProfile: boolean;
  canReceiveAlerts: boolean;
  notes: string | null;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  createdBy: string;
}

export interface HealthRecord {
  elderId: string;
  heartRate: number;
  spO2: number;
  gyroscope: 'Normal' | 'Fell';
  risk: 'Normal' | 'Warning' | 'Danger';
  location: {
    latitude: number;
    longitude: number;
  } | null;
  deviceId: string | null;
  source: 'manual' | 'wearable' | 'iot_device';
  recordedAt: FirebaseFirestoreTypes.Timestamp;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  text: string;
  senderId: string;
  senderRole: 'caregiver' | 'elder';
  isRead: boolean;
  readAt: FirebaseFirestoreTypes.Timestamp | null;
  attachments: {
    type: 'image' | 'file' | 'location';
    url: string;
  }[] | null;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface EmergencyAlert {
  alertId: string;
  elderId: string;
  type: 'manual' | 'fall_detected' | 'heart_rate' | 'spO2' | 'no_response';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm';
  location: {
    latitude: number;
    longitude: number;
    address: string | null;
  };
  healthData: {
    heartRate: number | null;
    spO2: number | null;
    gyroscope: string | null;
  };
  acknowledgedBy: string | null;
  acknowledgedAt: FirebaseFirestoreTypes.Timestamp | null;
  resolvedBy: string | null;
  resolvedAt: FirebaseFirestoreTypes.Timestamp | null;
  resolutionNotes: string | null;
  notifiedCaregivers: string[];
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========== User Functions ==========

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (
  uid: string,
  email: string,
  role: 'elder' | 'caregiver',
  firstName: string,
  lastName: string,
  tel: string | null = null,
  authProvider: 'email' | 'google' = 'email'
): Promise<ServiceResult<User>> => {
  try {
    const userData: User = {
      uid,
      email,
      role,
      firstName,
      lastName,
      tel,
      photoURL: null,
      authProvider,
      status: 'online',
      lastSeen: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      isActive: true,
    };

    await firestore().collection('users').doc(uid).set(userData);

    return {
      success: true,
      data: userData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create user profile',
    };
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<ServiceResult<User>> => {
  try {
    const userDoc = await firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User profile not found',
      };
    }

    return {
      success: true,
      data: userDoc.data() as User,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get user profile',
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: {
    firstName?: string;
    lastName?: string;
    tel?: string;
  }
): Promise<ServiceResult<void>> => {
  try {
    await firestore().collection('users').doc(uid).update(updates);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update user profile',
    };
  }
};

/**
 * Update user status (online/offline/busy)
 */
export const updateUserStatus = async (
  uid: string,
  status: 'online' | 'offline' | 'busy'
): Promise<ServiceResult> => {
  try {
    await firestore()
      .collection('users')
      .doc(uid)
      .update({
        status,
        lastSeen: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update user status',
    };
  }
};

// ========== Elder Functions ==========

/**
 * Create elder profile with initial health status
 */
export const createElderProfile = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    tel: string | null;
    height: number;
    weight: number;
    age: number;
    medicalHistory: string;
  },
  authProvider: 'email' | 'google' = 'email'
): Promise<ServiceResult<Elder>> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    // Create user profile first
    const userResult = await createUserProfile(
      userId,
      user.email!,
      'elder',
      data.firstName,
      data.lastName,
      data.tel,
      authProvider
    );

    if (!userResult.success) {
      return { success: false, error: userResult.error };
    }

    // Create elder-specific profile
    const elderData: Elder = {
      userId,
      height: data.height,
      weight: data.weight,
      age: data.age,
      medicalHistory: data.medicalHistory || '',
      bloodType: null,
      allergies: null,
      medications: null,
      emergencyContactName: null,
      emergencyContactTel: null,
      emergencyContactRelation: null,
      currentHealthStatus: {
        risk: 'Normal',
        heartRate: 70,
        spO2: 98,
        gyroscope: 'Normal',
        lastUpdated: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      },
      currentLocation: null,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
    };

    await firestore().collection('elders').doc(userId).set(elderData);

    return {
      success: true,
      data: elderData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create elder profile',
    };
  }
};

/**
 * Update elder's health status
 */
export const updateElderHealthStatus = async (
  elderId: string,
  healthData: {
    heartRate: number;
    spO2: number;
    gyroscope: 'Normal' | 'Fell';
    risk: 'Normal' | 'Warning' | 'Danger';
  }
): Promise<ServiceResult> => {
  try {
    await firestore()
      .collection('elders')
      .doc(elderId)
      .update({
        currentHealthStatus: {
          ...healthData,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    // Also create a health record for history
    await createHealthRecord(elderId, healthData);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update health status',
    };
  }
};

/**
 * Update elder's location
 */
export const updateElderLocation = async (
  elderId: string,
  latitude: number,
  longitude: number,
  accuracy: number | null = null
): Promise<ServiceResult> => {
  try {
    await firestore()
      .collection('elders')
      .doc(elderId)
      .update({
        currentLocation: {
          latitude,
          longitude,
          accuracy,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update location',
    };
  }
};

// ========== Caregiver Functions ==========

/**
 * Create caregiver profile
 */
export const createCaregiverProfile = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    tel: string | null;
  },
  authProvider: 'email' | 'google' = 'email'
): Promise<ServiceResult<Caregiver>> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    // Create user profile first
    const userResult = await createUserProfile(
      userId,
      user.email!,
      'caregiver',
      data.firstName,
      data.lastName,
      data.tel,
      authProvider
    );

    if (!userResult.success) {
      return { success: false, error: userResult.error };
    }

    // Create caregiver-specific profile
    const caregiverData: Caregiver = {
      userId,
      specialization: null,
      experience: null,
      certification: null,
      totalEldersCared: 0,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
    };

    await firestore().collection('caregivers').doc(userId).set(caregiverData);

    return {
      success: true,
      data: caregiverData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create caregiver profile',
    };
  }
};

// ========== Health Data Functions ==========

/**
 * Create health record (for history/charts)
 */
export const createHealthRecord = async (
  elderId: string,
  data: {
    heartRate: number;
    spO2: number;
    gyroscope: 'Normal' | 'Fell';
    risk: 'Normal' | 'Warning' | 'Danger';
  },
  location?: { latitude: number; longitude: number }
): Promise<ServiceResult> => {
  try {
    const recordData: Partial<HealthRecord> = {
      elderId,
      ...data,
      location: location || null,
      deviceId: null,
      source: 'manual',
      recordedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
    };

    await firestore()
      .collection('healthData')
      .doc(elderId)
      .collection('records')
      .add(recordData);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create health record',
    };
  }
};

/**
 * Get health history for charts
 */
export const getHealthHistory = async (
  elderId: string,
  limit: number = 7
): Promise<ServiceResult<HealthRecord[]>> => {
  try {
    const snapshot = await firestore()
      .collection('healthData')
      .doc(elderId)
      .collection('records')
      .orderBy('recordedAt', 'desc')
      .limit(limit)
      .get();

    const records = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as HealthRecord[];

    return {
      success: true,
      data: records.reverse(), // Reverse to show oldest first
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get health history',
    };
  }
};

// ========== Chat Functions ==========

/**
 * Create or get chat room
 */
export const getOrCreateChat = async (
  caregiverId: string,
  elderId: string
): Promise<ServiceResult<string>> => {
  try {
    const chatId = `caregiver_${caregiverId}_elder_${elderId}`;
    const chatRef = firestore().collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      // Create new chat
      await chatRef.set({
        chatId,
        participants: {
          caregiverId,
          elderId,
        },
        lastMessage: null,
        unreadCount: {
          caregiver: 0,
          elder: 0,
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      data: chatId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get or create chat',
    };
  }
};

/**
 * Send message
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderRole: 'caregiver' | 'elder',
  text: string
): Promise<ServiceResult> => {
  try {
    const messageData: Partial<ChatMessage> = {
      chatId,
      text,
      senderId,
      senderRole,
      isRead: false,
      readAt: null,
      attachments: null,
      timestamp: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
    };

    // Add message to subcollection
    await firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add(messageData);

    // Update chat with last message and unread count
    const receiverRole = senderRole === 'caregiver' ? 'elder' : 'caregiver';
    await firestore()
      .collection('chats')
      .doc(chatId)
      .update({
        lastMessage: {
          text,
          senderId,
          senderRole,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
        [`unreadCount.${receiverRole}`]: firestore.FieldValue.increment(1),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
};

// ========== Emergency Functions ==========

/**
 * Create emergency alert
 */
export const createEmergencyAlert = async (
  elderId: string,
  type: 'manual' | 'fall_detected' | 'heart_rate' | 'spO2' | 'no_response',
  location: { latitude: number; longitude: number },
  healthData: {
    heartRate: number | null;
    spO2: number | null;
    gyroscope: string | null;
  }
): Promise<ServiceResult<string>> => {
  try {
    const alertData: Partial<EmergencyAlert> = {
      elderId,
      type,
      severity: type === 'manual' ? 'critical' : 'high',
      status: 'active',
      location: {
        ...location,
        address: null,
      },
      healthData,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedBy: null,
      resolvedAt: null,
      resolutionNotes: null,
      notifiedCaregivers: [],
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
    };

    const docRef = await firestore().collection('emergencyAlerts').add(alertData);

    return {
      success: true,
      data: docRef.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create emergency alert',
    };
  }
};

// ========== Relationship Functions ==========

/**
 * Create relationship between caregiver and elder
 */
export const createRelationship = async (
  caregiverId: string,
  elderId: string,
  relationshipType: 'family' | 'professional' | 'volunteer' = 'family'
): Promise<ServiceResult<Relationship>> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    const relationshipId = `${caregiverId}_${elderId}`;
    const relationshipData: Relationship = {
      caregiverId,
      elderId,
      relationshipType,
      status: 'pending',
      canViewHealth: true,
      canEditProfile: false,
      canReceiveAlerts: true,
      notes: null,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      createdBy: user.uid,
    };

    await firestore().collection('relationships').doc(relationshipId).set(relationshipData);

    return {
      success: true,
      data: relationshipData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create relationship',
    };
  }
};

/**
 * Get all elders for a caregiver
 */
export const getCaregiverElders = async (
  caregiverId: string
): Promise<ServiceResult<Elder[]>> => {
  try {
    // Get relationships
    const relationshipsSnapshot = await firestore()
      .collection('relationships')
      .where('caregiverId', '==', caregiverId)
      .where('status', '==', 'active')
      .get();

    const elderIds = relationshipsSnapshot.docs.map((doc) => doc.data().elderId);

    if (elderIds.length === 0) {
      return { success: true, data: [] };
    }

    // Get elders data
    const eldersPromises = elderIds.map((elderId) =>
      firestore().collection('elders').doc(elderId).get()
    );

    const eldersSnapshots = await Promise.all(eldersPromises);
    const elders = eldersSnapshots
      .filter((doc) => doc.exists)
      .map((doc) => doc.data() as Elder);

    return {
      success: true,
      data: elders,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get caregiver elders',
    };
  }
};

/**
 * Search for an elder by UID (userId)
 */
export const searchElderByUid = async (
  uid: string
): Promise<ServiceResult<{ user: User; elder: Elder }>> => {
  try {
    // First, get user info
    const userResult = await getUserProfile(uid);
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: 'Elder not found',
      };
    }

    // Check if user is an elder
    if (userResult.data.role !== 'elder') {
      return {
        success: false,
        error: 'User is not an elder',
      };
    }

    // Get elder profile
    const elderDoc = await firestore().collection('elders').doc(uid).get();
    
    // If elder profile doesn't exist, create a default one
    let elderData: Elder;
    if (!elderDoc.exists) {
      // Create default elder profile
      elderData = {
        userId: uid,
        height: 0,
        weight: 0,
        age: 0,
        medicalHistory: '',
        bloodType: null,
        allergies: null,
        medications: null,
        emergencyContactName: null,
        emergencyContactTel: null,
        emergencyContactRelation: null,
        currentHealthStatus: {
          risk: 'Normal',
          heartRate: 70,
          spO2: 98,
          gyroscope: 'Normal',
          lastUpdated: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
        },
        currentLocation: null,
        createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
        updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      };
      
      // Save the default profile
      await firestore().collection('elders').doc(uid).set(elderData);
    } else {
      elderData = elderDoc.data() as Elder;
    }

    return {
      success: true,
      data: {
        user: userResult.data,
        elder: elderData,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to search elder',
    };
  }
};

/**
 * Get all caregivers for an elder
 */
export const getElderCaregivers = async (
  elderId: string
): Promise<ServiceResult<Caregiver[]>> => {
  try {
    // Get relationships
    const relationshipsSnapshot = await firestore()
      .collection('relationships')
      .where('elderId', '==', elderId)
      .where('status', '==', 'active')
      .get();

    const caregiverIds = relationshipsSnapshot.docs.map((doc) => doc.data().caregiverId);

    if (caregiverIds.length === 0) {
      return { success: true, data: [] };
    }

    // Get caregivers data
    const caregiversPromises = caregiverIds.map((caregiverId) =>
      firestore().collection('caregivers').doc(caregiverId).get()
    );

    const caregiversSnapshots = await Promise.all(caregiversPromises);
    const caregivers = caregiversSnapshots
      .filter((doc) => doc.exists)
      .map((doc) => doc.data() as Caregiver);

    return {
      success: true,
      data: caregivers,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get elder caregivers',
    };
  }
};

// =====================================
// Chat Functions
// =====================================

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

/**
 * Send a chat message
 */
export const sendChatMessage = async (
  elderId: string,
  caregiverId: string,
  senderId: string,
  senderName: string,
  message: string
): Promise<ServiceResult<void>> => {
  try {
    const chatId = [elderId, caregiverId].sort().join('_');
    
    await firestore().collection('chats').doc(chatId).collection('messages').add({
      senderId,
      senderName,
      message,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
};

/**
 * Listen to chat messages (real-time)
 */
export const listenToChatMessages = (
  elderId: string,
  caregiverId: string,
  onMessagesUpdate: (messages: ChatMessage[]) => void,
  onError: (error: string) => void
) => {
  const chatId = [elderId, caregiverId].sort().join('_');

  const unsubscribe = firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .onSnapshot(
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          senderId: doc.data().senderId,
          senderName: doc.data().senderName,
          message: doc.data().message,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        onMessagesUpdate(messages);
      },
      (error) => {
        onError(error.message || 'Failed to load messages');
      }
    );

  return unsubscribe;
};

// =====================================
// Emergency Alert Functions
// =====================================

export interface EmergencyAlert {
  id: string;
  elderId: string;
  elderName: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'resolved';
}

/**
 * Send an emergency alert
 */
export const sendEmergencyAlert = async (
  elderId: string,
  elderName: string,
  location?: { latitude: number; longitude: number }
): Promise<ServiceResult<string>> => {
  try {
    // Create the emergency alert
    const alertRef = await firestore().collection('emergencyAlerts').add({
      elderId,
      elderName,
      timestamp: firestore.FieldValue.serverTimestamp(),
      location: location || null,
      status: 'active',
    });

    // Get all caregivers for this elder
    const relationshipsSnapshot = await firestore()
      .collection('relationships')
      .where('elderId', '==', elderId)
      .where('status', '==', 'active')
      .get();

    // Send notification to each caregiver
    const notificationPromises = relationshipsSnapshot.docs.map((doc) => {
      const caregiverId = doc.data().caregiverId;
      return firestore().collection('notifications').add({
        userId: caregiverId,
        type: 'emergency',
        title: 'Emergency Alert!',
        message: `${elderName} needs immediate help!`,
        relatedId: alertRef.id,
        timestamp: firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    });

    await Promise.all(notificationPromises);

    return {
      success: true,
      data: alertRef.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send emergency alert',
    };
  }
};

/**
 * Resolve an emergency alert
 */
export const resolveEmergencyAlert = async (
  alertId: string
): Promise<ServiceResult<void>> => {
  try {
    await firestore().collection('emergencyAlerts').doc(alertId).update({
      status: 'resolved',
      resolvedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to resolve emergency alert',
    };
  }
};

/**
 * Listen to emergency alerts for a caregiver
 */
export const listenToEmergencyAlerts = (
  caregiverId: string,
  onAlertsUpdate: (alerts: EmergencyAlert[]) => void,
  onError: (error: string) => void
) => {
  // First, get all elder IDs for this caregiver
  const unsubscribeRelationships = firestore()
    .collection('relationships')
    .where('caregiverId', '==', caregiverId)
    .where('status', '==', 'active')
    .onSnapshot(
      (relationshipsSnapshot) => {
        const elderIds = relationshipsSnapshot.docs.map((doc) => doc.data().elderId);

        if (elderIds.length === 0) {
          onAlertsUpdate([]);
          return;
        }

        // Listen to active alerts for these elders
        const unsubscribeAlerts = firestore()
          .collection('emergencyAlerts')
          .where('elderId', 'in', elderIds)
          .where('status', '==', 'active')
          .orderBy('timestamp', 'desc')
          .onSnapshot(
            (alertsSnapshot) => {
              const alerts = alertsSnapshot.docs.map((doc) => ({
                id: doc.id,
                elderId: doc.data().elderId,
                elderName: doc.data().elderName,
                timestamp: doc.data().timestamp?.toDate() || new Date(),
                location: doc.data().location || undefined,
                status: doc.data().status,
              }));
              onAlertsUpdate(alerts);
            },
            (error) => {
              onError(error.message || 'Failed to load emergency alerts');
            }
          );

        return unsubscribeAlerts;
      },
      (error) => {
        onError(error.message || 'Failed to load relationships');
      }
    );

  return unsubscribeRelationships;
};

// =====================================
// Notification Functions
// =====================================

export interface Notification {
  id: string;
  userId: string;
  type: 'emergency' | 'message' | 'danger' | 'warning' | 'elder_accept' | 'caregiver_request';
  title: string;
  message: string;
  relatedId?: string;
  timestamp: Date;
  read: boolean;
}

export interface NotificationPreferences {
  userId: string;
  emergencyAlerts: boolean;
  healthChanges: boolean;
  chatMessages: boolean;
  relationshipRequests: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // e.g., "22:00"
  quietHoursEnd?: string; // e.g., "07:00"
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface PrivacyPreferences {
  userId: string;
  locationSharing: boolean;
  healthDataSharing: boolean;
  shareHeartRate: boolean;
  shareSpO2: boolean;
  shareFallDetection: boolean;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

/**
 * Listen to notifications for a user
 */
export const listenToNotifications = (
  userId: string,
  onNotificationsUpdate: (notifications: Notification[]) => void,
  onError: (error: string) => void
) => {
  const unsubscribe = firestore()
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot(
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          type: doc.data().type,
          title: doc.data().title,
          message: doc.data().message,
          relatedId: doc.data().relatedId || undefined,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          read: doc.data().read || false,
        }));
        onNotificationsUpdate(notifications);
      },
      (error) => {
        onError(error.message || 'Failed to load notifications');
      }
    );

  return unsubscribe;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<ServiceResult<void>> => {
  try {
    await firestore().collection('notifications').doc(notificationId).update({
      read: true,
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark notification as read',
    };
  }
};

/**
 * Get pending caregiver requests for an elder
 */
export const getPendingCaregiverRequests = (
  elderId: string,
  onRequestsUpdate: (requests: Array<{ id: string; caregiverId: string; caregiverName: string }>) => void,
  onError: (error: string) => void
) => {
  const unsubscribe = firestore()
    .collection('relationships')
    .where('elderId', '==', elderId)
    .where('status', '==', 'pending')
    .onSnapshot(
      async (snapshot) => {
        const requestPromises = snapshot.docs.map(async (doc) => {
          const caregiverId = doc.data().caregiverId;
          const caregiverProfile = await getUserProfile(caregiverId);
          
          return {
            id: doc.id,
            caregiverId,
            caregiverName: caregiverProfile.success && caregiverProfile.data
              ? `${caregiverProfile.data.firstName} ${caregiverProfile.data.lastName}`
              : 'Unknown',
          };
        });

        const requests = await Promise.all(requestPromises);
        onRequestsUpdate(requests);
      },
      (error) => {
        onError(error.message || 'Failed to load caregiver requests');
      }
    );

  return unsubscribe;
};

/**
 * Accept or decline a caregiver request
 */
export const respondToCaregiverRequest = async (
  relationshipId: string,
  accept: boolean
): Promise<ServiceResult<void>> => {
  try {
    if (accept) {
      const relDoc = await firestore().collection('relationships').doc(relationshipId).get();
      const caregiverId = relDoc.exists ? (relDoc.data() as Relationship).caregiverId : null;

      await firestore().collection('relationships').doc(relationshipId).update({
        status: 'active',
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      if (caregiverId) {
        await firestore()
          .collection('caregivers')
          .doc(caregiverId)
          .update({
            totalEldersCared: firestore.FieldValue.increment(1),
          });
      }
    } else {
      await firestore().collection('relationships').doc(relationshipId).delete();
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to respond to caregiver request',
    };
  }
};

/**
 * Listener: caregiver's sent requests (pending + accepted)
 * For use in caregiver Notification > Elder Accept tab
 */
export type CaregiverSentRequest = {
  id: string;
  elderId: string;
  elderName: string;
  elderPhotoURL: string | null;
  status: 'pending' | 'active';
  createdAt: Date;
};

export const listenToCaregiverSentRequests = (
  caregiverId: string,
  onRequestsUpdate: (requests: CaregiverSentRequest[]) => void,
  onError: (error: string) => void
) => {
  const unsubscribe = firestore()
    .collection('relationships')
    .where('caregiverId', '==', caregiverId)
    .where('status', 'in', ['pending', 'active'])
    .onSnapshot(
      async (snapshot) => {
        const requests: CaregiverSentRequest[] = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data() as Relationship;
            const elderProfile = await getUserProfile(data.elderId);
            const user = elderProfile.success && elderProfile.data ? elderProfile.data : null;
            const createdAt = data.createdAt as FirebaseFirestoreTypes.Timestamp;
            return {
              id: doc.id,
              elderId: data.elderId,
              elderName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
              elderPhotoURL: user?.photoURL ?? null,
              status: data.status,
              createdAt: createdAt?.toDate?.() || new Date(),
            };
          })
        );
        // Pending first, then accepted; within each, newest first
        requests.sort((a, b) => {
          if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        onRequestsUpdate(requests);
      },
      (error) => {
        onError(error.message || 'Failed to load sent requests');
      }
    );
  return unsubscribe;
};

/**
 * Cancel a pending request (caregiver cancels before elder accepts)
 */
export const cancelCaregiverRequest = async (
  relationshipId: string
): Promise<ServiceResult<void>> => {
  try {
    const doc = await firestore().collection('relationships').doc(relationshipId).get();
    if (!doc.exists) {
      return { success: false, error: 'Request not found' };
    }
    const data = doc.data() as Relationship;
    if (data.status !== 'pending') {
      return { success: false, error: 'Only pending requests can be cancelled' };
    }
    await firestore().collection('relationships').doc(relationshipId).delete();
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to cancel request',
    };
  }
};

// ========== Image Upload Functions ==========

/**
 * Upload image to Firebase Storage
 * @param uri - Local image URI
 * @param path - Storage path (e.g., 'users/uid/profile.jpg')
 * @returns Download URL
 */
export const uploadImage = async (
  uri: string,
  path: string
): Promise<ServiceResult<string>> => {
  try {
    const reference = storage().ref(path);
    await reference.putFile(uri);
    const downloadURL = await reference.getDownloadURL();
    return { success: true, data: downloadURL };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
};

/**
 * Update user profile image
 * @param userId - User ID
 * @param imageUri - Local image URI
 */
export const updateProfileImage = async (
  userId: string,
  imageUri: string
): Promise<ServiceResult<string>> => {
  try {
    const path = `users/${userId}/profile.jpg`;
    const uploadResult = await uploadImage(imageUri, path);
    
    if (!uploadResult.success || !uploadResult.data) {
      return uploadResult;
    }

    const photoURL = uploadResult.data;

    // Update in users collection
    await firestore().collection('users').doc(userId).update({
      photoURL,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, data: photoURL };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update profile image',
    };
  }
};

/**
 * Update background image for elder or caregiver profile
 * @param userId - User ID
 * @param role - User role ('elder' or 'caregiver')
 * @param imageUri - Local image URI
 */
export const updateBackgroundImage = async (
  userId: string,
  role: 'elder' | 'caregiver',
  imageUri: string
): Promise<ServiceResult<string>> => {
  try {
    const path = `${role}s/${userId}/background.jpg`;
    const uploadResult = await uploadImage(imageUri, path);
    
    if (!uploadResult.success || !uploadResult.data) {
      return uploadResult;
    }

    const backgroundImageURL = uploadResult.data;

    // Update in elders or caregivers collection
    await firestore().collection(`${role}s`).doc(userId).update({
      backgroundImageURL,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, data: backgroundImageURL };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update background image',
    };
  }
};

// ========== Relationship Management ==========

/**
 * Delete relationship between caregiver and elder
 * @param caregiverId - Caregiver user ID
 * @param elderId - Elder user ID
 * @returns Success result
 */
export const deleteRelationship = async (
  caregiverId: string,
  elderId: string
): Promise<ServiceResult<void>> => {
  try {
    // Find the relationship document
    const relationshipsSnapshot = await firestore()
      .collection('relationships')
      .where('caregiverId', '==', caregiverId)
      .where('elderId', '==', elderId)
      .get();

    if (relationshipsSnapshot.empty) {
      return {
        success: false,
        error: 'Relationship not found',
      };
    }

    // Delete the relationship document
    const relationshipDoc = relationshipsSnapshot.docs[0];
    await relationshipDoc.ref.delete();

    // Optional: Create a notification for the other party
    const notificationMessage = 'A relationship has been removed';
    
    // Notify caregiver
    await firestore().collection('notifications').add({
      userId: caregiverId,
      type: 'relationship_removed',
      title: 'Relationship Removed',
      message: notificationMessage,
      read: false,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    // Notify elder
    await firestore().collection('notifications').add({
      userId: elderId,
      type: 'relationship_removed',
      title: 'Relationship Removed',
      message: notificationMessage,
      read: false,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete relationship',
    };
  }
};

// ========== Notification Preferences ==========

/**
 * Get notification preferences for a user
 * @param userId - User ID
 * @returns Notification preferences or default values
 */
export const getNotificationPreferences = async (
  userId: string
): Promise<ServiceResult<NotificationPreferences>> => {
  try {
    const doc = await firestore()
      .collection('notificationPreferences')
      .doc(userId)
      .get();

    if (doc.exists) {
      return {
        success: true,
        data: doc.data() as NotificationPreferences,
      };
    }

    // Return default preferences
    const defaultPreferences: NotificationPreferences = {
      userId,
      emergencyAlerts: true,
      healthChanges: true,
      chatMessages: true,
      relationshipRequests: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      updatedAt: firestore.Timestamp.now(),
    };

    return { success: true, data: defaultPreferences };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get notification preferences',
    };
  }
};

/**
 * Save notification preferences for a user
 * @param preferences - Notification preferences
 * @returns Success result
 */
export const saveNotificationPreferences = async (
  preferences: Partial<NotificationPreferences> & { userId: string }
): Promise<ServiceResult<void>> => {
  try {
    await firestore()
      .collection('notificationPreferences')
      .doc(preferences.userId)
      .set(
        {
          ...preferences,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save notification preferences',
    };
  }
};

// ========== Privacy Preferences ==========

/**
 * Get privacy preferences for a user
 * @param userId - User ID
 * @returns Privacy preferences or default values
 */
export const getPrivacyPreferences = async (
  userId: string
): Promise<ServiceResult<PrivacyPreferences>> => {
  try {
    const doc = await firestore()
      .collection('privacyPreferences')
      .doc(userId)
      .get();

    if (doc.exists) {
      return {
        success: true,
        data: doc.data() as PrivacyPreferences,
      };
    }

    // Return default preferences (all enabled by default)
    const defaultPreferences: PrivacyPreferences = {
      userId,
      locationSharing: true,
      healthDataSharing: true,
      shareHeartRate: true,
      shareSpO2: true,
      shareFallDetection: true,
      updatedAt: firestore.Timestamp.now(),
    };

    return { success: true, data: defaultPreferences };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get privacy preferences',
    };
  }
};

/**
 * Save privacy preferences for a user
 * @param preferences - Privacy preferences
 * @returns Success result
 */
export const savePrivacyPreferences = async (
  preferences: Partial<PrivacyPreferences> & { userId: string }
): Promise<ServiceResult<void>> => {
  try {
    await firestore()
      .collection('privacyPreferences')
      .doc(preferences.userId)
      .set(
        {
          ...preferences,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save privacy preferences',
    };
  }
};

// ========== Account Deletion ==========

/**
 * Delete user account and all associated data
 * @param userId - User ID
 * @param userRole - User role ('elder' or 'caregiver')
 * @returns Success result
 */
export const deleteUserAccount = async (
  userId: string,
  userRole: 'elder' | 'caregiver'
): Promise<ServiceResult<void>> => {
  try {
    // 1. Delete all relationships
    const relationshipsSnapshot = await firestore()
      .collection('relationships')
      .where(userRole === 'elder' ? 'elderId' : 'caregiverId', '==', userId)
      .get();

    const deletePromises = relationshipsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // 2. Delete notifications
    const notificationsSnapshot = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .get();
    
    await Promise.all(notificationsSnapshot.docs.map(doc => doc.ref.delete()));

    // 3. Delete chats (find all chats where user is participant)
    const chatsSnapshot = await firestore()
      .collection('chats')
      .where(`participants.${userRole}Id`, '==', userId)
      .get();

    for (const chatDoc of chatsSnapshot.docs) {
      // Delete messages subcollection
      const messagesSnapshot = await chatDoc.ref.collection('messages').get();
      await Promise.all(messagesSnapshot.docs.map(msgDoc => msgDoc.ref.delete()));
      
      // Delete chat document
      await chatDoc.ref.delete();
    }

    // 4. Delete emergency alerts (if elder)
    if (userRole === 'elder') {
      const alertsSnapshot = await firestore()
        .collection('emergencyAlerts')
        .where('elderId', '==', userId)
        .get();
      
      await Promise.all(alertsSnapshot.docs.map(doc => doc.ref.delete()));
    }

    // 5. Delete preferences
    await firestore().collection('notificationPreferences').doc(userId).delete();
    await firestore().collection('privacyPreferences').doc(userId).delete();

    // 6. Delete role-specific data
    await firestore().collection(`${userRole}s`).doc(userId).delete();

    // 7. Delete user profile
    await firestore().collection('users').doc(userId).delete();

    // 8. Delete Firebase Auth account
    const currentUser = auth().currentUser;
    if (currentUser && currentUser.uid === userId) {
      await currentUser.delete();
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete account',
    };
  }
};
