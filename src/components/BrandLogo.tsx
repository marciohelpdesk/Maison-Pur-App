import { useState, useCallback } from 'react';
import { BRAND_LOGO_PRIMARY, BRAND_LOGO_FALLBACK } from '@/lib/brand';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo = ({ className = '', alt = 'Maison Pur' }: BrandLogoProps) => {
  const [src, setSrc] = useState(BRAND_LOGO_PRIMARY);
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    if (!failed) {
      setFailed(true);
      setSrc(BRAND_LOGO_FALLBACK);
    }
  }, [failed]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Detect tiny placeholder images (imgbb returns ~161x81 placeholder)
    if (!failed && img.naturalWidth > 0 && img.naturalWidth < 50 && img.naturalHeight < 50) {
      setFailed(true);
      setSrc(BRAND_LOGO_FALLBACK);
    }
  }, [failed]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      referrerPolicy="no-referrer"
    />
  );
};
