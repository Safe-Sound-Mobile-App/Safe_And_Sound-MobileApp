import firestore from '@react-native-firebase/firestore';
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
