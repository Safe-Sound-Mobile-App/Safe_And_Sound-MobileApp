import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import {
  getUserProfile,
  getPendingCaregiverRequests,
  listenToNotifications,
} from '../services/firestore';

interface NotificationBadgeContextType {
  hasNew: boolean;
}

const NotificationBadgeContext = createContext<NotificationBadgeContextType>({ hasNew: false });

export const useNotificationBadge = () => useContext(NotificationBadgeContext);

export const NotificationBadgeProvider = ({ children }: { children: ReactNode }) => {
  const [hasNew, setHasNew] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((firebaseUser) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (!firebaseUser) {
        setHasNew(false);
        return;
      }

      let hasPending = false;
      let hasUnread = false;
      const updateBadge = () => setHasNew(hasPending || hasUnread);

      getUserProfile(firebaseUser.uid).then((profile) => {
        const role = profile.success && profile.data ? profile.data.role : null;
        let unsubSent: (() => void) | null = null;
        let unsubNotifs: (() => void) | null = null;
        let unsubPending: (() => void) | null = null;

        if (role === 'caregiver') {
          // For caregiver: badge should reflect unread notifications only.
          // Pending *outgoing* sent requests should not keep the badge "stuck"
          // after user reads the notifications list.
        } else if (role === 'elder') {
          unsubPending = getPendingCaregiverRequests(
            firebaseUser.uid,
            (requests) => {
              hasPending = requests.length > 0;
              updateBadge();
            },
            () => {}
          );
        }

        unsubNotifs = listenToNotifications(
          firebaseUser.uid,
          (notifications) => {
            hasUnread = notifications.some((n) => !n.read);
            updateBadge();
          },
          () => {}
        );

        cleanupRef.current = () => {
          unsubSent?.();
          unsubNotifs?.();
          unsubPending?.();
        };
      });
    });

    return () => {
      unsubscribeAuth();
      cleanupRef.current?.();
    };
  }, []);

  return (
    <NotificationBadgeContext.Provider value={{ hasNew }}>
      {children}
    </NotificationBadgeContext.Provider>
  );
};
