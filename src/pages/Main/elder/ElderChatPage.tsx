import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import auth from '@react-native-firebase/auth';
import { sendChatMessage, listenToChatMessages, getUserProfile, ChatMessage } from '../../../services/firestore';

type Props = NativeStackScreenProps<RootStackParamList, "ElderChatPage">;

export default function ElderChatPage({ route, navigation }: Props) {
    const { caregiverId, caregiverName } = route.params as { caregiverId: string; caregiverName: string };
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No authenticated user');
            navigation.goBack();
            return;
        }

        // Fetch current user's name
        const fetchUserName = async () => {
            const result = await getUserProfile(currentUser.uid);
            if (result.success && result.data) {
                setCurrentUserName(`${result.data.firstName} ${result.data.lastName}`);
            }
        };
        fetchUserName();

        // Listen to chat messages
        const unsubscribe = listenToChatMessages(
            currentUser.uid,
            caregiverId,
            (newMessages) => {
                setMessages(newMessages);
                // Auto-scroll to bottom when new message arrives
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            },
            (error) => {
                Alert.alert('Error', error);
            }
        );

        return () => unsubscribe();
    }, [caregiverId]);

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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
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
                        }}
                        placeholder="Type a message..."
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
