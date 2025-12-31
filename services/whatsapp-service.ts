const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

const ACCESS_TOKEN = process.env.EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID!;
const BUSINESS_ACCOUNT_ID = process.env.EXPO_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID!;

interface WhatsAppMessage {
  to: string; // número com código do país, ex: 5561999999999
  type: 'text' | 'template' | 'image' | 'document' | 'audio' | 'video';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

export async function sendWhatsAppMessage(message: WhatsAppMessage) {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`WhatsApp API Error: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    throw error;
  }
}

export async function sendTextMessage(to: string, text: string) {
  return sendWhatsAppMessage({
    to,
    type: 'text',
    text: { body: text },
  });
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'pt_BR',
  components?: any[]
) {
  return sendWhatsAppMessage({
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

export async function markMessageAsRead(messageId: string) {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    throw error;
  }
}

export async function getBusinessProfile() {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar perfil business:', error);
    throw error;
  }
}

// Webhook para receber mensagens (configurar no Meta Developer)
export function handleWebhook(payload: any) {
  if (payload.object === 'whatsapp_business_account') {
    payload.entry?.forEach((entry: any) => {
      entry.changes?.forEach((change: any) => {
        if (change.field === 'messages') {
          const messages = change.value?.messages || [];
          messages.forEach((message: any) => {
            console.log('Mensagem recebida:', message);
            // Processar mensagem aqui
          });
        }
      });
    });
  }
}

// Gera código de verificação aleatório de 6 dígitos
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Envia código de verificação via WhatsApp
export async function sendVerificationCode(phoneNumber: string, code: string) {
  const message = `Seu código de verificação é: *${code}*\n\nEste código expira em 5 minutos.\n\nSe você não solicitou este código, ignore esta mensagem.`;
  
  return sendTextMessage(phoneNumber, message);
}

// Armazena códigos de verificação temporariamente (em produção use Redis ou Firestore)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export function storeVerificationCode(phoneNumber: string, code: string) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos
  verificationCodes.set(phoneNumber, { code, expiresAt });
}

export function verifyCode(phoneNumber: string, inputCode: string): boolean {
  const stored = verificationCodes.get(phoneNumber);
  
  if (!stored) return false;
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(phoneNumber);
    return false;
  }
  
  if (stored.code === inputCode) {
    verificationCodes.delete(phoneNumber);
    return true;
  }
  
  return false;
}

