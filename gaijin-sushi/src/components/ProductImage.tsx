import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

interface Props {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export default function ProductImage({ src, alt, className = '', eager }: Props) {
  const [failed, setFailed] = useState(false);
  const { t } = useI18n();

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-surface text-mute ${className}`}>
        <ImageOff size={28} />
        <span className="px-2 text-center text-xs">{t('error.imageFallback')}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`bg-surface object-cover ${className}`}
    />
  );
}
