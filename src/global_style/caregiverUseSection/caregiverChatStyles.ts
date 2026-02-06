import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },

  // Chat Header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  elderProfilePic: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d1d5db',
  },
  headerTextContainer: {
    flex: 1,
  },
  elderNameHeader: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'BalooBhaijaan2_400Regular',
  },
  statusIcon: {
    width: 14,
    height: 14,
  },
  lastActive: {
    fontSize: 11,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#9ca3af',
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  elderMessageContainer: {
    justifyContent: 'flex-start',
  },
  caregiverMessageContainer: {
    justifyContent: 'flex-end',
  },

  // Avatars
  elderAvatar: {
    marginRight: 8,
  },
  caregiverAvatar: {
    marginLeft: 8,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
  },

  // Message Bubbles
  messageBubbleWrapper: {
    maxWidth: '70%',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  elderBubble: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  caregiverBubble: {
    backgroundColor: '#e5e7eb',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'BalooBhaijaan2_400Regular',
    lineHeight: 20,
  },
  elderMessageText: {
    color: '#374151',
  },
  caregiverMessageText: {
    color: '#374151',
  },

  // Message Footer
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  caregiverMessageFooter: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#9ca3af',
  },

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});