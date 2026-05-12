// Temporary switch for onboarding verification gates.
// Set to false when WhatsApp code verification should be required again.
export const TEMPORARILY_DISABLE_WHATSAPP_VERIFICATION = true;

export function shouldSkipWhatsappVerification() {
  return (
    TEMPORARILY_DISABLE_WHATSAPP_VERIFICATION ||
    process.env.EXPO_PUBLIC_SKIP_WHATSAPP_VERIFICATION === 'true'
  );
}
