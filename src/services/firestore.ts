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
      status: 'active',
      canViewHealth: true,
      canEditProfile: false,
      canReceiveAlerts: true,
      notes: null,
      createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
      createdBy: user.uid,
    };

    await firestore().collection('relationships').doc(relationshipId).set(relationshipData);

    // Update caregiver's elder count
    await firestore()
      .collection('caregivers')
      .doc(caregiverId)
      .update({
        totalEldersCared: firestore.FieldValue.increment(1),
      });

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
      await firestore().collection('relationships').doc(relationshipId).update({
        status: 'active',
        acceptedAt: firestore.FieldValue.serverTimestamp(),
      });
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
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Notify elder
    await firestore().collection('notifications').add({
      userId: elderId,
      type: 'relationship_removed',
      title: 'Relationship Removed',
      message: notificationMessage,
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete relationship',
    };
  }
};
