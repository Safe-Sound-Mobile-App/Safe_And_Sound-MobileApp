import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chatStyles } from '../../../global_style/caregiverUseSection/caregiverChatStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

interface Message {
  id: string;
  text: string;
  sender: 'caregiver' | 'elder';
  timestamp: string;
  isRead: boolean;
}

interface ChatInfo {
  elderName: string;
  elderImage: any;
  status: 'Normal' | 'Warning' | 'Danger';
  lastActive: string;
}

export default function CaregiverChat({ navigation, route }: Props) {
  const { elderId, elderName } = route.params || {};
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [chatInfo] = useState<ChatInfo>({
    elderName: elderName || 'Elder1',
    elderImage: null, // require('../../../../assets/images/elder1.png')
    status: 'Danger',
    lastActive: '20 March 2025',
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello, how are you?',
      sender: 'elder',
      timestamp: '11:00',
      isRead: true,
    },
    {
      id: '2',
      text: "I'm fine, thank you!",
      sender: 'caregiver',
      timestamp: '11:00',
      isRead: true,
    },
  ]);

  const [inputText, setInputText] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Get status color
  const getStatusColor = () => {
    switch (chatInfo.status) {
      case 'Danger': return '#ef4444';
      case 'Warning': return '#f59e0b';
      case 'Normal': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (chatInfo.status === 'Danger' || chatInfo.status === 'Warning') {
      return triangleIcon;
    }
    return null;
  };

  // Handle send message
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'caregiver',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Mock elder response after 2 seconds
    setTimeout(() => {
      const elderResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message!',
        sender: 'elder',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isRead: false,
      };
      setMessages(prev => [...prev, elderResponse]);
    }, 2000);
  };

  // Render message bubble
  const renderMessage = (message: Message) => {
    const isCaregiver = message.sender === 'caregiver';

    return (
      <View
        key={message.id}
        style={[
          chatStyles.messageContainer,
          isCaregiver ? chatStyles.caregiverMessageContainer : chatStyles.elderMessageContainer
        ]}
      >
        {!isCaregiver && (
          <View style={chatStyles.elderAvatar}>
            {chatInfo.elderImage ? (
              <Image
                source={chatInfo.elderImage}
                style={chatStyles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={chatStyles.avatarPlaceholder} />
            )}
          </View>
        )}

        <View style={chatStyles.messageBubbleWrapper}>
          <View
            style={[
              chatStyles.messageBubble,
              isCaregiver ? chatStyles.caregiverBubble : chatStyles.elderBubble
            ]}
          >
            <Text style={[
              chatStyles.messageText,
              isCaregiver ? chatStyles.caregiverMessageText : chatStyles.elderMessageText
            ]}>
              {message.text}
            </Text>
          </View>

          <View style={[
            chatStyles.messageFooter,
            isCaregiver && chatStyles.caregiverMessageFooter
          ]}>
            <Text style={chatStyles.timestamp}>{message.timestamp}</Text>
            {isCaregiver && message.isRead && (
              <Ionicons name="checkmark-done" size={14} color="#10b981" />
            )}
          </View>
        </View>

        {isCaregiver && (
          <View style={chatStyles.caregiverAvatar}>
            <View style={chatStyles.avatarPlaceholder} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={chatStyles.container}>
      <GradientHeader title="Safe & Sound" />

      <KeyboardAvoidingView
        style={chatStyles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={chatStyles.chatHeader}>
          <TouchableOpacity
            style={chatStyles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View style={chatStyles.headerInfo}>
            <View style={chatStyles.elderProfilePic}>
              {chatInfo.elderImage ? (
                <Image
                  source={chatInfo.elderImage}
                  style={chatStyles.headerAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={chatStyles.headerAvatarPlaceholder} />
              )}
            </View>

            <View style={chatStyles.headerTextContainer}>
              <Text style={chatStyles.elderNameHeader}>{chatInfo.elderName}</Text>
              
              <View style={chatStyles.statusContainer}>
                <Text style={[chatStyles.statusText, { color: getStatusColor() }]}>
                  Status: {chatInfo.status}
                </Text>
                {getStatusIcon() && (
                  <Image
                    source={getStatusIcon()!}
                    style={[chatStyles.statusIcon, { tintColor: getStatusColor() }]}
                    resizeMode="contain"
                  />
                )}
              </View>

              <Text style={chatStyles.lastActive}>{chatInfo.lastActive}</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={chatStyles.messagesContainer}
          contentContainerStyle={chatStyles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => renderMessage(message))}
        </ScrollView>

        {/* Input Area */}
        <View style={[chatStyles.inputContainer, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <TextInput
            style={chatStyles.textInput}
            placeholder="Type message..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={chatStyles.sendButton}
            onPress={handleSendMessage}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}