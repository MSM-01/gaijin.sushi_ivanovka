interface Props {
  /** Высота логотипа в пикселях */
  height?: number;
  className?: string;
}

/**
 * Официальный логотип GAIJIN. Файл используется без изменений
 * (только обрезаны поля), поэтому он лежит на собственном светлом фоне —
 * так цвета логотипа одинаковы в светлой и тёмной теме.
 */
export default function Logo({ height = 44, className = '' }: Props) {
  return (
    <img
      src="/logo.jpg"
      alt="GAIJIN SUSHI"
      height={height}
      style={{ height, width: 'auto' }}
      className={`select-none rounded-xl ${className}`}
      draggable={false}
    />
  );
}
