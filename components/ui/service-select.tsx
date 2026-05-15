import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@/components/ui/hugeicons-icon';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

interface ServiceSelectProps {
  services: string[];
  selectedService: string;
  onSelectService: (service: string) => void;
  placeholder?: string;
  label?: string;
  allowCustom?: boolean;
}

const OPTION_ROW_HEIGHT = 57;
const MODAL_HORIZONTAL_PADDING = 24;
const MODAL_BOTTOM_PADDING = 40;
const MODAL_HEADER_HEIGHT = 73;
const CUSTOM_BLOCK_HEIGHT = 182;
const CUSTOM_ACTION_HEIGHT = 72;
const EXTRA_SPACING = 16;

export function ServiceSelect({
  services,
  selectedService,
  onSelectService,
  placeholder = 'Selecione um serviço',
  label,
  allowCustom = false,
}: ServiceSelectProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customService, setCustomService] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const customInputRef = useRef<TextInput>(null);
  const customFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setShowCustomInput(false);
    setCustomService('');
    setKeyboardHeight(0);
  };

  const handleSelect = (service: string) => {
    if (service === 'OUTRO') {
      setShowCustomInput(true);
      return;
    }

    onSelectService(service);
    closeModal();
  };

  const handleCustomSubmit = () => {
    if (customService.trim()) {
      onSelectService(customService.trim());
      closeModal();
    }
  };

  useEffect(() => {
    if (!modalVisible || !showCustomInput) {
      if (customFocusTimeoutRef.current) {
        clearTimeout(customFocusTimeoutRef.current);
        customFocusTimeoutRef.current = null;
      }
      return;
    }

    if (customFocusTimeoutRef.current) {
      clearTimeout(customFocusTimeoutRef.current);
    }

    customFocusTimeoutRef.current = setTimeout(() => {
      customInputRef.current?.focus();
    }, 140);

    return () => {
      if (customFocusTimeoutRef.current) {
        clearTimeout(customFocusTimeoutRef.current);
        customFocusTimeoutRef.current = null;
      }
    };
  }, [modalVisible, showCustomInput]);

  useEffect(() => {
    if (!modalVisible || !showCustomInput) {
      setKeyboardHeight(0);
      return;
    }

    const syncKeyboardHeight = (event: any) => {
      setKeyboardHeight(event?.endCoordinates?.height ?? 0);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', syncKeyboardHeight);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    const frameSubscriptions =
      Platform.OS === 'ios'
        ? [
            Keyboard.addListener('keyboardWillChangeFrame', syncKeyboardHeight),
            Keyboard.addListener('keyboardDidChangeFrame', syncKeyboardHeight),
          ]
        : [];

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      frameSubscriptions.forEach((subscription) => subscription.remove());
    };
  }, [modalVisible, showCustomInput]);

  const maxModalHeight = Math.min(windowHeight - 48, windowHeight * 0.88);
  const customLayoutActive = showCustomInput && keyboardHeight > 0;
  const customModeMaxHeight = Math.max(180, Math.min(maxModalHeight, windowHeight - keyboardHeight - 24));

  const serviceListHeight = useMemo(() => {
    const baseHeight =
      MODAL_HEADER_HEIGHT +
      MODAL_BOTTOM_PADDING +
      (allowCustom ? CUSTOM_ACTION_HEIGHT : 0) +
      EXTRA_SPACING;

    const availableForList = Math.max(
      120,
      maxModalHeight - baseHeight - MODAL_HORIZONTAL_PADDING
    );

    const contentHeight = services.length * OPTION_ROW_HEIGHT;
    return Math.min(contentHeight, availableForList);
  }, [allowCustom, maxModalHeight, services.length]);

  const idleModalHeight = useMemo(() => {
    const bodyHeight =
      MODAL_HEADER_HEIGHT +
      serviceListHeight +
      (allowCustom ? CUSTOM_ACTION_HEIGHT : 0) +
      MODAL_BOTTOM_PADDING +
      EXTRA_SPACING;

    return Math.min(maxModalHeight, bodyHeight);
  }, [allowCustom, maxModalHeight, serviceListHeight]);

  const modalHeight = useMemo(() => {
    if (showCustomInput) {
      if (!customLayoutActive) {
        return idleModalHeight;
      }

      return Math.min(
        customModeMaxHeight,
        MODAL_HEADER_HEIGHT + CUSTOM_BLOCK_HEIGHT + MODAL_BOTTOM_PADDING
      );
    }

    return idleModalHeight;
  }, [customLayoutActive, customModeMaxHeight, idleModalHeight, showCustomInput]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !selectedService && styles.placeholder]}>
          {selectedService || placeholder}
        </Text>
        <HugeiconsIcon icon={ArrowDown01Icon} size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View
          style={[
            styles.modalOverlay,
            customLayoutActive && { paddingBottom: keyboardHeight },
          ]}
        >
          <View style={[styles.modalContent, { maxHeight: maxModalHeight, height: modalHeight }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showCustomInput ? 'Novo serviço' : 'Selecione o serviço'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>

            {showCustomInput ? (
              <KeyboardAvoidingView
                style={styles.modalBody}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <ScrollView
                  contentContainerStyle={styles.customInputContainer}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.customInputLabel}>Digite o nome do serviço:</Text>
                  <TextInput
                    style={styles.customInput}
                    ref={customInputRef}
                    value={customService}
                    onChangeText={setCustomService}
                    placeholder="Ex: Eletricista, Encanador..."
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={handleCustomSubmit}
                  />
                  <View style={styles.customButtons}>
                    <TouchableOpacity
                      style={styles.customButtonCancel}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowCustomInput(false);
                        setCustomService('');
                      }}
                    >
                      <Text style={styles.customButtonCancelText}>Voltar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.customButtonConfirm,
                        !customService.trim() && styles.customButtonDisabled,
                      ]}
                      onPress={handleCustomSubmit}
                      disabled={!customService.trim()}
                    >
                      <Text style={styles.customButtonConfirmText}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            ) : (
              <View style={styles.modalBody}>
                <ScrollView
                  style={[styles.optionsList, { maxHeight: serviceListHeight }]}
                  contentContainerStyle={styles.optionsListContent}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={services.length * OPTION_ROW_HEIGHT > serviceListHeight}
                >
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service}
                      style={[
                        styles.optionItem,
                        selectedService === service && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelect(service)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedService === service && styles.optionTextSelected,
                        ]}
                      >
                        {service}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {allowCustom && (
                  <View style={styles.topAction}>
                    <TouchableOpacity
                      style={styles.otherOptionButton}
                      onPress={() => handleSelect('OUTRO')}
                    >
                      <Text style={styles.otherOptionText}>+ Outro serviço</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  selectText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    overflow: 'hidden',
  },
  modalBody: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  optionsList: {
    flex: 1,
  },
  optionsListContent: {
    paddingBottom: 8,
  },
  optionItem: {
    minHeight: OPTION_ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#F9FAFB',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  topAction: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  otherOptionText: {
    color: '#0066FF',
    fontWeight: '600',
  },
  otherOptionButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
  },
  customInputContainer: {
    padding: 24,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  customInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
  },
  customButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  customButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  customButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  customButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  customButtonDisabled: {
    opacity: 0.5,
  },
  customButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
