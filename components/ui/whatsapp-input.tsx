import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  mask: string;
  placeholder: string;
}

const COUNTRIES: Country[] = [
  {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    dialCode: '+55',
    mask: '(99) 99999-9999',
    placeholder: '(11) 99999-9999',
  },
  {
    code: 'PY',
    name: 'Paraguai',
    flag: '🇵🇾',
    dialCode: '+595',
    mask: '(999) 999-999',
    placeholder: '(981) 123-456',
  },
];

interface WhatsappInputProps {
  value: string;
  onChangeValue: (fullNumber: string) => void;
  label?: string;
  readonly?: boolean;
  error?: string;
}

export function WhatsappInput({
  value,
  onChangeValue,
  label = 'WhatsApp',
  readonly = false,
  error,
}: WhatsappInputProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [localValue, setLocalValue] = useState('');

  // Inicializa o valor local baseado no value prop
  React.useEffect(() => {
    if (value) {
      const digits = value.replace(/\D/g, '');
      
      // Detecta o país pelo prefixo
      if (digits.startsWith('55')) {
        setSelectedCountry(COUNTRIES[0]); // Brasil
        setLocalValue(formatPhoneNumber(digits.slice(2), COUNTRIES[0]));
      } else if (digits.startsWith('595')) {
        setSelectedCountry(COUNTRIES[1]); // Paraguai
        setLocalValue(formatPhoneNumber(digits.slice(3), COUNTRIES[1]));
      } else {
        setLocalValue(digits);
      }
    }
  }, []);

  const formatPhoneNumber = (digits: string, country: Country): string => {
    if (!digits) return '';
    
    if (country.code === 'BR') {
      // (XX) XXXXX-XXXX
      const match = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted = `(${match[1]}`;
        if (match[1]?.length === 2) formatted += ') ';
        if (match[2]) formatted += match[2];
        if (match[2]?.length === 5) formatted += '-';
        if (match[3]) formatted += match[3];
        return formatted;
      }
    } else if (country.code === 'PY') {
      // (XXX) XXX-XXX
      const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,3})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted = `(${match[1]}`;
        if (match[1]?.length === 3) formatted += ') ';
        if (match[2]) formatted += match[2];
        if (match[2]?.length === 3) formatted += '-';
        if (match[3]) formatted += match[3];
        return formatted;
      }
    }
    
    return digits;
  };

  const handleTextChange = (text: string) => {
    if (readonly) return;
    
    // Remove tudo que não é dígito
    const digits = text.replace(/\D/g, '');
    
    // Limita o tamanho
    const maxLength = selectedCountry.code === 'BR' ? 11 : 9;
    const limitedDigits = digits.slice(0, maxLength);
    
    // Formata para exibição
    const formatted = formatPhoneNumber(limitedDigits, selectedCountry);
    setLocalValue(formatted);
    
    // Envia o número completo (código do país + número)
    const dialDigits = selectedCountry.dialCode.replace(/\D/g, '');
    onChangeValue(limitedDigits ? `${dialDigits}${limitedDigits}` : '');
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Recalcula o valor com o novo código de país
    const digits = localValue.replace(/\D/g, '');
    const dialDigits = country.dialCode.replace(/\D/g, '');
    onChangeValue(digits ? `${dialDigits}${digits}` : '');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {/* Seletor de país */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => !readonly && setShowCountryPicker(true)}
          disabled={readonly}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          {!readonly && (
            <HugeiconsIcon icon={ArrowDown01Icon} size={16} color="#6B7280" />
          )}
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Input do número */}
        <TextInput
          style={styles.input}
          value={localValue}
          onChangeText={handleTextChange}
          placeholder={selectedCountry.placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          editable={!readonly}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal de seleção de país */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o país</Text>
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryOption,
                  selectedCountry.code === country.code && styles.countryOptionSelected,
                ]}
                onPress={() => handleCountrySelect(country)}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryDialCode}>{country.dialCode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  countryOptionSelected: {
    backgroundColor: '#EBF5FF',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  countryDialCode: {
    fontSize: 14,
    color: '#6B7280',
  },
});
