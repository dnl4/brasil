import { validateDisplayNameFormat } from '../services/user-service';

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

