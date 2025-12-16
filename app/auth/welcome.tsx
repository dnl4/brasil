import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const userName = 'Danilo'; // This would come from user data/context
  const insets = useSafeAreaInsets();

  const handleAccessAccount = () => {
    router.push('/auth/login');
  };

  const handleCreateAccount = () => {
    router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      {/* Pink Background Area */}
      <View style={styles.topArea} />

      {/* Bottom White Card */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom || 48 }]}>
        <Text style={styles.greeting}>Oi, {userName}</Text>

        {/* Access Account Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAccessAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Acessar minha conta</Text>
        </TouchableOpacity>

        {/* Create Account Link */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleCreateAccount}
        >
          <Text style={styles.linkText}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE8E8',
  },
  topArea: {
    flex: 1,
    backgroundColor: '#FDE8E8',
  },
  bottomCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 28,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
});
