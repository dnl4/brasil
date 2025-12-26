import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

type FocusEvent = Parameters<NonNullable<RNTextInputProps['onFocus']>>[0];

interface InputFieldProps extends RNTextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  onFocusWithPosition?: (y: number) => void;
  error?: string;
  helperText?: string;
}

export interface InputFieldRef {
  focus: () => void;
  measureLayout: (callback: (y: number) => void) => void;
}

export const InputField = forwardRef<InputFieldRef, InputFieldProps>(({
  label,
  containerStyle,
  style,
  placeholderTextColor = '#999',
  onFocus,
  onFocusWithPosition,
  error,
  helperText,
  ...props
}, ref) => {
  const containerRef = useRef<View>(null);
  const inputRef = useRef<RNTextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    measureLayout: (callback) => {
      containerRef.current?.measureInWindow((x, y) => {
        callback(y);
      });
    },
  }));

  const handleFocus = useCallback((e: FocusEvent) => {
    onFocus?.(e);
    
    if (onFocusWithPosition) {
      containerRef.current?.measureInWindow((x, y) => {
        onFocusWithPosition(y);
      });
    }
  }, [onFocus, onFocusWithPosition]);

  return (
    <View ref={containerRef} style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        ref={inputRef}
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={placeholderTextColor}
        onFocus={handleFocus}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
