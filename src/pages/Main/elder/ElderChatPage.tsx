import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import auth from '@react-native-firebase/auth';
import { sendChatMessage, listenToChatMessages, getUserProfile, ChatMessage, resetChatUnreadCount } from '../../../services/firestore';

type Props = NativeStackScreenProps<RootStackParamList, "ElderChatPage">;

export default function ElderChatPage({ route, navigation }: Props) {
    const { caregiverId, caregiverName } = route.params as { caregiverId: string; caregiverName: string };
    const insets = useSafeAreaInsets();
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUserName, setCurrentUserName] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No authenticated user');
            navigation.goBack();
            return;
        }

        let unsubscribe: (() => void) | undefined;

        const init = async () => {
            // Fetch current user's name
            const result = await getUserProfile(currentUser.uid);
            if (result.success && result.data) {
                setCurrentUserName(`${result.data.firstName} ${result.data.lastName}`);
            }

            // Create chat document and reset unread count when opening chat
            // ✅ await ก่อน subscribe เพื่อให้ chat doc พร้อมก่อน rules ตรวจสอบ
            await resetChatUnreadCount(currentUser.uid, caregiverId, currentUser.uid);

            // Listen to chat messages
            unsubscribe = listenToChatMessages(
                currentUser.uid,
                caregiverId,
                (newMessages) => {
                    setMessages(newMessages);
                    setLoading(false);
                    // Auto-scroll to bottom when new message arrives
                    setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                },
                (error) => {
                    console.error('Chat error:', error);
                    setLoading(false);
                    Alert.alert('Error', error);
                }
            );
        };

        init().catch((error) => {
            console.error('Failed to initialize chat:', error);
            setLoading(false);
        });

        return () => unsubscribe?.();
    }, [caregiverId]);

    // Track keyboard height for Android to maintain consistent position
    useEffect(() => {
        if (Platform.OS === 'android') {
            const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            });
            const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0);
            });

            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }
    }, []);

    // Handle keyboard events for Android - removed manual handling
    // Using KeyboardAvoidingView with adjustResize from AndroidManifest.xml

    const handleSend = async () => {
        const currentUser = auth().currentUser;
        if (!currentUser || !inputText.trim()) return;

        setSending(true);
        const result = await sendChatMessage(
            currentUser.uid,
            caregiverId,
            currentUser.uid,
            currentUserName,
            inputText.trim()
        );

        if (result.success) {
            setInputText('');
        } else {
            Alert.alert('Error', result.error || 'Failed to send message');
        }
        setSending(false);
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const currentUser = auth().currentUser;
        const isMyMessage = item.senderId === currentUser?.uid;

        return (
            <View
                style={{
                    marginVertical: 4,
                    marginHorizontal: 16,
                    alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                }}
            >
                <View
                    style={{
                        maxWidth: '75%',
                        backgroundColor: isMyMessage ? '#008080' : '#f3f4f6',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 16,
                        borderBottomRightRadius: isMyMessage ? 4 : 16,
                        borderBottomLeftRadius: isMyMessage ? 16 : 4,
                    }}
                >
                    {!isMyMessage && (
                        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: '600' }}>
                            {item.senderName}
                        </Text>
                    )}
                    <Text style={{ fontSize: 15, color: isMyMessage ? '#fff' : '#1f2937' }}>
                        {item.message}
                    </Text>
                    <Text style={{ fontSize: 11, color: isMyMessage ? '#d1fae5' : '#9ca3af', marginTop: 4 }}>
                        {item.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
            <GradientHeader />
            
            {/* Chat Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
                    {caregiverName}
                </Text>
            </View>

            {Platform.OS === 'ios' ? (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    keyboardVerticalOffset={90}
                >
                    <View style={{ flex: 1 }}>
                        {/* Messages List */}
                        {loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#008080" />
                                <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
                                    Loading messages...
                                </Text>
                            </View>
                        ) : messages.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
                                <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                                    No messages yet
                                </Text>
                                <Text style={{ marginTop: 8, color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                                    Start a conversation with {caregiverName}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingVertical: 8 }}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                keyboardShouldPersistTaps="handled"
                                style={{ flex: 1 }}
                            />
                        )}

                        {/* Input Area - Always at bottom */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingTop: 12,
                            paddingBottom: keyboardHeight > 0 ? 0 : (insets.bottom || 0),
                            borderTopWidth: 1,
                            borderTopColor: '#e5e7eb',
                            backgroundColor: '#fff',
                        }}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    backgroundColor: '#f9fafb',
                                    borderRadius: 20,
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    fontSize: 15,
                                    marginRight: 8,
                                    color: '#000000',
                                }}
                                placeholder="Type a message..."
                                placeholderTextColor="#9ca3af"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                editable={!sending}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={!inputText.trim() || sending}
                                style={{
                                    backgroundColor: inputText.trim() && !sending ? '#008080' : '#d1d5db',
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    keyboardVerticalOffset={0}
                >
                    <View style={{ flex: 1 }}>
                        {/* Messages List */}
                        {loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#008080" />
                                <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
                                    Loading messages...
                                </Text>
                            </View>
                        ) : messages.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
                                <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                                    No messages yet
                                </Text>
                                <Text style={{ marginTop: 8, color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                                    Start a conversation with {caregiverName}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingVertical: 8 }}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                keyboardShouldPersistTaps="handled"
                                style={{ flex: 1 }}
                            />
                        )}

                        {/* Input Area - Always at bottom, consistent padding */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingTop: 12,
                            paddingBottom: keyboardHeight > 0 ? 12 : (12 || 0),
                            borderTopWidth: 1,
                            borderTopColor: '#e5e7eb',
                            backgroundColor: '#fff',
                        }}>
                        <TextInput
                            style={{
                                flex: 1,
                                backgroundColor: '#f9fafb',
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                fontSize: 15,
                                marginRight: 8,
                                color: '#000000', // Black text color
                            }}
                            placeholder="Type a message..."
                            placeholderTextColor="#9ca3af" // Grey placeholder
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!sending}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim() || sending}
                            style={{
                                backgroundColor: inputText.trim() && !sending ? '#008080' : '#d1d5db',
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}
