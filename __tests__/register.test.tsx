import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import RegisterScreen from '../app/auth/register';
import { isDisplayNameAvailable, isPhoneNumberAvailable } from '../services/user-service';

const mockShow = jest.fn();
const mockValidateDisplayNameFormat = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn() },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  auth: {},
}));

jest.mock('../components/ui/snackbar', () => ({
  useSnackbar: () => ({ show: mockShow }),
}));

jest.mock('../services/user-service', () => ({
  isDisplayNameAvailable: jest.fn().mockResolvedValue(true),
  isPhoneNumberAvailable: jest.fn().mockResolvedValue(true),
  updateUserProfile: jest.fn().mockResolvedValue(undefined),
  validateDisplayNameFormat: (...args: any[]) => mockValidateDisplayNameFormat(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@hugeicons/react-native', () => ({
  HugeiconsIcon: () => null,
}));

jest.mock('@hugeicons/core-free-icons', () => ({
  ArrowDown01Icon: 'ArrowDown01Icon',
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateDisplayNameFormat.mockImplementation((displayName: string) => {
      const trimmed = displayName?.trim() || '';
      if (!trimmed) {
        return { valid: false, error: 'Nome de exibição é obrigatório' };
      }
      if (trimmed.length < 3) {
        return { valid: false, error: 'Nome deve ter pelo menos 3 caracteres' };
      }
      return { valid: true };
    });
  });

  it('renderiza campos e botão de registro', () => {
    render(<RegisterScreen />);

    expect(screen.getByTestId('displayname-input')).toBeTruthy();
    expect(screen.getByTestId('fullname-input')).toBeTruthy();
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('register-button')).toBeTruthy();
  });

  it('mostra erro se senhas não coincidem', async () => {
    render(<RegisterScreen />);

    const displayNameInput = screen.getByTestId('displayname-input');
    const fullNameInput = screen.getByTestId('fullname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    await act(async () => {
      fireEvent.changeText(displayNameInput, 'usuario1');
      fireEvent.changeText(fullNameInput, 'Nome Teste');
      fireEvent.changeText(emailInput, 'teste@email.com');
      fireEvent.changeText(passwordInput, 'senha123');
      fireEvent.changeText(confirmPasswordInput, 'senha456');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith(
        'As senhas não coincidem.',
        { backgroundColor: '#ba1a1a' }
      );
    });
  });

  it('cria conta com sucesso', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: '123' },
    });
    (updateProfile as jest.Mock).mockResolvedValue(undefined);

    render(<RegisterScreen />);

    const displayNameInput = screen.getByTestId('displayname-input');
    const fullNameInput = screen.getByTestId('fullname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    await act(async () => {
      fireEvent.changeText(displayNameInput, 'usuario1');
      fireEvent.changeText(fullNameInput, 'Nome Teste');
      fireEvent.changeText(emailInput, 'teste@email.com');
      fireEvent.changeText(passwordInput, 'senha123');
      fireEvent.changeText(confirmPasswordInput, 'senha123');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('mostra erro se displayName já está em uso', async () => {
    (isDisplayNameAvailable as jest.Mock).mockResolvedValue(false);

    render(<RegisterScreen />);

    await act(async () => {
      fireEvent.changeText(screen.getByTestId('displayname-input'), 'usuario1');
      fireEvent.changeText(screen.getByTestId('fullname-input'), 'Nome Teste');
      fireEvent.changeText(screen.getByTestId('email-input'), 'teste@email.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'senha123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'senha123');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith(
        'Este nome de exibição já está em uso',
        { backgroundColor: '#ba1a1a' }
      );
    });
  });

  it('mostra erro se email já está em uso', async () => {
    (isDisplayNameAvailable as jest.Mock).mockResolvedValue(true);
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/email-already-in-use',
    });

    render(<RegisterScreen />);

    await act(async () => {
      fireEvent.changeText(screen.getByTestId('displayname-input'), 'usuario1');
      fireEvent.changeText(screen.getByTestId('fullname-input'), 'Nome Teste');
      fireEvent.changeText(screen.getByTestId('email-input'), 'teste@email.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'senha123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'senha123');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith(
        'Este email já está em uso.',
        { backgroundColor: '#ba1a1a' }
      );
    });
  });

  it('mostra erro se WhatsApp já está em uso', async () => {
    (isDisplayNameAvailable as jest.Mock).mockResolvedValue(true);
    (isPhoneNumberAvailable as jest.Mock).mockResolvedValue(false);

    render(<RegisterScreen />);

    await act(async () => {
      fireEvent.changeText(screen.getByTestId('displayname-input'), 'usuario1');
      fireEvent.changeText(screen.getByTestId('fullname-input'), 'Nome Teste');
      fireEvent.changeText(screen.getByTestId('email-input'), 'teste@email.com');
      fireEvent.changeText(screen.getByTestId('whatsapp-input'), '5511999999999');
      fireEvent.changeText(screen.getByTestId('password-input'), 'senha123');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'senha123');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-button'));
    });

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith(
        'Este WhatsApp já está em uso',
        { backgroundColor: '#ba1a1a' }
      );
    });
  });
});

