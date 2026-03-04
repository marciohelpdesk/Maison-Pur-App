import { BRAND_LOGO_PRIMARY } from '@/lib/brand';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo = ({ className = '', alt = 'Maison Pur' }: BrandLogoProps) => {
  return (
    <img
      src={BRAND_LOGO_PRIMARY}
      alt={alt}
      className={className}
    />
  );
};
