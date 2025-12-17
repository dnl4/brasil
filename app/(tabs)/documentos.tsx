import { useAuth } from '@/contexts/auth-context';
import { db } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useSnackbar } from '@/components/ui/snackbar';

const CACHE_KEY = 'documents_completed';

interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  details: string;
}

// Dados estáticos fora do componente - edições aqui atualizam com Hot Reload
const DOCUMENTS: DocumentInfo[] = [
  { 
    id: '1', 
    title: 'RG ou Passaporte', 
    description: 'Documento de identificação brasileiro',
    details: 'O RG (Registro Geral) ou Passaporte válido é essencial para sua identificação. Certifique-se de que o documento esteja em bom estado e com validade adequada para todo o período de sua estadia.'
  },
  { 
    id: '2', 
    title: 'Certidão de Nascimento ou Casamento', 
    description: 'Com apostilamento de Haia',
    details: 'A certidão deve ser apostilada conforme a Convenção de Haia. O apostilamento pode ser feito em cartórios autorizados e garante a validade internacional do documento.'
  },
  { 
    id: '3', 
    title: 'Certificado de Antecedentes', 
    description: 'Polícia Federal',
    details: 'Solicite o Certificado de Antecedentes Criminais no site da Polícia Federal (www.pf.gov.br). O documento é gratuito e pode ser emitido online com validade de 90 dias.'
  },
  { 
    id: '4', 
    title: 'CIVP para Febre Amarela', 
    description: 'Certificado Internacional de Vacinação',
    details: 'O CIVP (Certificado Internacional de Vacinação ou Profilaxia) é emitido pela ANVISA após vacinação contra febre amarela. Agende a emissão pelo site da ANVISA com pelo menos 10 dias de antecedência.'
  },
];

export default function DocumentosScreen() {
  const { user } = useAuth();
  const { show } = useSnackbar();
  // Estado começa vazio e é carregado do cache local instantaneamente
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Salvar no cache local
  const saveToCache = async (data: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  };

  // Carregar do cache local (instantâneo) e depois sincronizar com Firebase
  useEffect(() => {
    const loadData = async () => {
      // 1. Primeiro carrega do cache local (instantâneo)
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setCompletedItems(JSON.parse(cached));
        }
      } catch (error) {
        console.error('Erro ao carregar cache:', error);
      }

      // 2. Depois sincroniza com Firebase em background (se tiver usuário)
      if (!user) return;
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const savedDocuments = docSnap.data().documents;
          if (savedDocuments) {
            setCompletedItems(savedDocuments);
            // Atualiza o cache com os dados do Firebase
            await saveToCache(savedDocuments);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar do Firebase:', error);
      }
    };

    loadData();
  }, [user]);

  const toggleItem = async (id: string) => {
    const newCompleted = !completedItems[id];
    const newCompletedItems = { ...completedItems, [id]: newCompleted };
    setCompletedItems(newCompletedItems);
    // Salva no cache local imediatamente
    await saveToCache(newCompletedItems);
    // Salva no Firebase automaticamente se usuário estiver logado
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { documents: newCompletedItems }, { merge: true });
      } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
      }
    }
  };

  const saveToFirebase = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { documents: completedItems }, { merge: true });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Erro ao salvar documentos:', error);
      show('Erro ao salvar documentos. Tente novamente.', { backgroundColor: '#ba1a1a' });
    }
  };

  const loadFromFirebase = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const savedDocuments = docSnap.data().documents;
        if (savedDocuments) {
          setCompletedItems(savedDocuments);
          // Atualiza o cache local
          await saveToCache(savedDocuments);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearCheckboxes = async () => {
    setCompletedItems({});
    // Limpa também o cache local
    await saveToCache({});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documentos</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={saveToFirebase}>
          <Text style={styles.actionButtonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.loadButton]} onPress={loadFromFirebase} disabled={isSyncing}>
          <Text style={styles.actionButtonText}>{isSyncing ? 'Carregando...' : 'Carregar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearCheckboxes}>
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>Limpar</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {DOCUMENTS.map((item, index) => (
          <View key={item.id} style={styles.timelineItemContainer}>
            <View style={styles.timelineLeft}>
              <TouchableOpacity 
                onPress={() => toggleItem(item.id)}
                style={[
                  styles.checkbox,
                  completedItems[item.id] && styles.checkboxCompleted
                ]}
              >
                {completedItems[item.id] && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              {index < DOCUMENTS.length - 1 && (
                <View style={styles.connector} />
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.timelineRight}
              onPress={() => toggleExpanded(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.titleRow}>
                <View style={styles.titleContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <View style={styles.moreDetailsButton}>
                  <Text style={styles.moreDetailsText}>
                    {expandedItems[item.id] ? 'Menos' : 'Mais detalhes'}
                  </Text>
                  <Text style={styles.chevron}>
                    {expandedItems[item.id] ? '▲' : '▼'}
                  </Text>
                </View>
              </View>
              {expandedItems[item.id] && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsText}>{item.details}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Dialog de sucesso */}
      <CustomDialog
        visible={showSuccessDialog}
        title="Documentos salvos!"
        message="Seus documentos foram sincronizados com sucesso."
        onClose={() => setShowSuccessDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: '#3B82F6',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  timelineItemContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    minHeight: 40,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContent: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  moreDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  moreDetailsText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  chevron: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
