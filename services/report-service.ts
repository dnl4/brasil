import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '@/firebaseConfig';

export type ReportReason = 'fake' | 'offensive' | 'spam' | 'other';

export interface Report {
  id: string;
  ratingId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
  createdAt: Date;
}

export interface CreateReportData {
  ratingId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
}

const REPORTS_COLLECTION = 'reports';

export const REPORT_REASONS: Record<ReportReason, string> = {
  fake: 'Avaliação falsa',
  offensive: 'Conteúdo ofensivo',
  spam: 'Spam',
  other: 'Outro motivo',
};

/**
 * Cria uma denúncia de avaliação
 */
export async function createReport(data: CreateReportData): Promise<string> {
  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
}
