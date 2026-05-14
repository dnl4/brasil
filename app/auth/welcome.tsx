import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const cardsWidth = Math.min(width - 36, 372);
  const cardsHeight = cardsWidth * (314 / 372);
  const bottomSafePadding = Math.max(insets.bottom + 30, 34);

  const handleAccessAccount = () => {
    router.push('/auth/login');
  };

  const handleCreateAccount = () => {
    router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.topArea, { paddingTop: Math.max(insets.top + 16, 52) }]}>
        <View pointerEvents="none" style={styles.backgroundLights}>
          <View style={[styles.lightOrb, styles.greenLight]} />
          <View style={[styles.lightOrb, styles.blueLight]} />
        </View>

        <Image
          source={require('@/assets/images/Overlaybrasiguaios.png')}
          style={styles.brandOverlay}
          resizeMode="contain"
        />

        <Image
          source={require('@/assets/images/cards_brasiguaios.png')}
          style={[styles.cardsImage, { width: cardsWidth, height: cardsHeight }]}
          resizeMode="contain"
        />

        <Text style={styles.headline}>
          Avaliações que ajudam{'\n'}
          você a <Text style={styles.headlineHighlight}>decidir melhor.</Text>
        </Text>
      </View>

      <View style={[styles.bottomCard, { paddingBottom: bottomSafePadding }]}>
        <Text style={styles.greeting}>Bem vindo</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAccessAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Acessar minha conta</Text>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.accountText}>Não tem uma conta?</Text>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleCreateAccount}
          activeOpacity={0.75}
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
    backgroundColor: '#101415',
  },
  topArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#101415',
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  backgroundLights: {
    ...StyleSheet.absoluteFillObject,
  },
  lightOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  greenLight: {
    width: 430,
    height: 430,
    left: -434,
    top: -142,
    backgroundColor: '#65DF76',
    opacity: 0.42,
    shadowColor: '#33eb4c',
    shadowOffset: { width: 246, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 90,
  },
  blueLight: {
    width: 370,
    height: 370,
    right: -434,
    top: 196,
    backgroundColor: '#BFC6DB',
    opacity: 0.42,
    shadowColor: '#dde3f5',
    shadowOffset: { width: -246, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 92,
  },
  brandOverlay: {
    width: 255,
    height: 74,
    marginBottom: 54,
  },
  cardsImage: {
    marginBottom: 24,
  },
  headline: {
    alignSelf: 'stretch',
    color: '#F1F4F5',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 33,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  headlineHighlight: {
    color: '#54EF80',
  },
  bottomCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 31,
    paddingTop: 21,
  },
  greeting: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#1F1F21',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.23,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  accountText: {
    color: '#667085',
    fontSize: 14,
    marginTop: 29,
    textAlign: 'center',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#0A3767',
    fontWeight: '800',
  },
});
