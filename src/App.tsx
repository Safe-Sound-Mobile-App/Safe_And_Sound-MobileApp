import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import './style/app.css';

export default function App() {
  return (
    <View style={styles.container}>
      <Text className="text-green-500">Open up App.js to start working on your app!</Text>
      <p>Welcome to the Safe and Sound mobile application!</p>
      <title>Safe and Sound!</title>
      <h1>Safe and Sound</h1>
      <h2>Safe and Sound</h2>
      <h3>Mobile App</h3>
      <h4>Safe and Sound</h4>
      <h5>Safe and Sound</h5>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
