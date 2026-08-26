import QRCode from 'qrcode';

export const generateQrCodeForUrl = async (url: string): Promise<string> => {
  if (!url) return '';
  try {
    const dataUrl = await QRCode.toDataURL(url, {
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

export const generateCompanyQrCode = async (companyId: string, customOrigin?: string): Promise<string> => {
  if (!companyId) return '';
  const baseOrigin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://atrios.app');
  const verifyUrl = `${baseOrigin}/?cert=${encodeURIComponent(companyId)}`;
  return generateQrCodeForUrl(verifyUrl);
};
