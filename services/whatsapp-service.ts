const WHATSAPP_API_VERSION = 'v24.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

const ACCESS_TOKEN = process.env.EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID!;

interface TemplateComponent {
  type: 'body' | 'header' | 'button';
  parameters?: {
    type: 'text';
    text: string;
  }[];
  sub_type?: 'url' | 'quick_reply';
  index?: string;
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components?: TemplateComponent[]
) {
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
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components || [],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`WhatsApp API Error: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao enviar template WhatsApp:', error);
    throw error;
  }
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

// Envia código de verificação via WhatsApp usando template 'verify_code'
// IMPORTANTE: Template deve estar previamente criado no Meta Business Manager
export async function sendVerificationCode(phoneNumber: string, code: string) {
  return sendTemplateMessage(
    phoneNumber,
    'verify_code',
    'en',
    [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: code,
          },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: code,
          },
        ],
      },
    ]
  );
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
