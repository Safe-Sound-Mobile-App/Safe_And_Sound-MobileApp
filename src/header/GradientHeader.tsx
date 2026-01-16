import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { headerStyles } from './headerStyles';

interface GradientHeaderProps {
  title?: string;
  fontSize?: number;
}

export default function GradientHeader({ 
  title = "Safe & Sound",
  fontSize = 24 
}: GradientHeaderProps) {
    return (
        <View style={headerStyles.header}>
            {/* App title with gradient */}
            <MaskedView
                style={headerStyles.titleContainer}
                maskElement={
                <Text style={headerStyles.titleMask}>
                    Safe & Sound
                </Text>
                }
            >
                <LinearGradient
                colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={headerStyles.gradientTitle}
                >
                <Text style={headerStyles.title}>
                    Safe & Sound
                </Text>
                </LinearGradient>
            </MaskedView>
        </View>
  );
}