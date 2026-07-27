import QRCode from 'qrcode';

export const generateCompanyQrCode = async (companyId: string, customOrigin?: string): Promise<string> => {
  if (!companyId) return '';
  const baseOrigin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://atrios.app');
  const verifyUrl = `${baseOrigin}/?cert=${encodeURIComponent(companyId)}`;
  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 350,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
};
