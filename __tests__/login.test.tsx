import { fireEvent, render, screen } from '@testing-library/react-native';
import LoginScreen from '../app/auth/login';

const mockShow = jest.fn();
const mockSignOut = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  auth: { signOut: () => mockSignOut() },
}));

jest.mock('../contexts/auth-context', () => ({
  useAuth: () => ({ setHoldRedirect: jest.fn() }),
}));

jest.mock('../components/ui/snackbar', () => ({
  useSnackbar: () => ({ show: mockShow }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('LoginScreen', () => {
  it('renderiza campos de email, senha e botão', () => {
    render(<LoginScreen />);

    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });

  it('permite digitar email e senha', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.changeText(emailInput, 'teste@email.com');
    fireEvent.changeText(passwordInput, 'senha123');

    expect(emailInput.props.value).toBe('teste@email.com');
    expect(passwordInput.props.value).toBe('senha123');
  });
});

