import { getDocs, query, where } from 'firebase/firestore';
import { isDisplayNameAvailable, validateDisplayNameFormat } from '../services/user-service';

jest.mock('@/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('validateDisplayNameFormat', () => {
  it('deve aceitar username com apenas letras minúsculas', () => {
    const result = validateDisplayNameFormat('usuario');
    expect(result.valid).toBe(true);
  });

  it('deve aceitar username com apenas números', () => {
    const result = validateDisplayNameFormat('123456');
    expect(result.valid).toBe(true);
  });

  it('deve aceitar username com letras minúsculas e números', () => {
    const result = validateDisplayNameFormat('usuario123');
    expect(result.valid).toBe(true);
  });

  it('deve aceitar username com letras maiúsculas (convertidas para minúsculas)', () => {
    const result = validateDisplayNameFormat('Usuario');
    expect(result.valid).toBe(true);
  });

  it('deve aceitar username misto e converter tudo para minúsculas', () => {
    const result = validateDisplayNameFormat('UsUaRiO123');
    expect(result.valid).toBe(true);
  });

  it('deve rejeitar username com espaços', () => {
    const result = validateDisplayNameFormat('user name');
    expect(result.valid).toBe(false);
  });

  it('deve rejeitar username com caracteres especiais', () => {
    const result = validateDisplayNameFormat('user@name');
    expect(result.valid).toBe(false);
  });

  it('deve rejeitar username com underscore', () => {
    const result = validateDisplayNameFormat('user_name');
    expect(result.valid).toBe(false);
  });

  it('deve rejeitar username com hífen', () => {
    const result = validateDisplayNameFormat('user-name');
    expect(result.valid).toBe(false);
  });

  it('deve rejeitar username vazio', () => {
    const result = validateDisplayNameFormat('');
    expect(result.valid).toBe(false);
  });

  it('deve rejeitar username com menos de 3 caracteres', () => {
    const result = validateDisplayNameFormat('ab');
    expect(result.valid).toBe(false);
  });

  it('deve rejeitar username com mais de 20 caracteres', () => {
    const result = validateDisplayNameFormat('abcdefghijklmnopqrstuvwxyz');
    expect(result.valid).toBe(false);
  });
});

describe('isDisplayNameAvailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar false quando dois usuários tentam usar o mesmo username', async () => {
    const displayName = 'usuario123';
    
    // Mock para simular que já existe um usuário com esse displayName
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ id: 'user1' }],
    });

    // Tenta verificar disponibilidade para um segundo usuário
    const available = await isDisplayNameAvailable(displayName, 'user2');
    
    expect(available).toBe(false);
    expect(query).toHaveBeenCalled();
    expect(where).toHaveBeenCalledWith('displayName', '==', 'usuario123');
  });

  it('deve retornar true quando o username não está em uso', async () => {
    const displayName = 'novouser';
    
    (getDocs as jest.Mock).mockResolvedValue({
      empty: true,
      docs: [],
    });

    const available = await isDisplayNameAvailable(displayName);
    
    expect(available).toBe(true);
  });

  it('deve permitir que o mesmo usuário mantenha seu próprio username', async () => {
    const displayName = 'usuario123';
    const userId = 'user1';
    
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ id: 'user1' }],
    });

    const available = await isDisplayNameAvailable(displayName, userId);
    
    expect(available).toBe(true);
  });
});

