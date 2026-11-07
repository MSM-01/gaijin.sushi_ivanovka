import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { INFO } from '../data/info';
import { useI18n } from '../i18n/useI18n';

export default function Footer() {
  const { t, tr } = useI18n();
  const rows = [
    INFO.phone && { icon: Phone, label: t('contacts.phone'), value: INFO.phone, href: `tel:${INFO.phone.replace(/\s/g, '')}` },
    (INFO.address.ru || INFO.address.en) && { icon: MapPin, label: t('contacts.address'), value: tr(INFO.address) },
    (INFO.hours.ru || INFO.hours.en) && { icon: Clock, label: t('contacts.hours'), value: tr(INFO.hours) },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <footer className="mt-12 border-t border-line bg-surface pb-28 pt-10 print:hidden">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-2">
        <section id="about">
          <Logo height={56} />
          <h2 className="mt-5 font-display text-lg">{t('about.title')}</h2>
          <p className="mt-2 max-w-md leading-relaxed text-mute">{t('about.text')}</p>
        </section>

        <section id="contacts">
          <h2 className="font-display text-lg">{t('contacts.title')}</h2>
          <ul className="mt-3 space-y-3">
            <li>
              <a
                href={INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 font-semibold transition hover:text-brand"
              >
                <Instagram size={20} className="text-brand" />
                <span>
                  <span className="block text-xs font-medium text-mute">{t('contacts.instagram')}</span>
                  {INFO.instagramHandle}
                </span>
              </a>
            </li>
            {rows.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-center gap-3 font-semibold">
                <Icon size={20} className="text-brand" />
                <span>
                  <span className="block text-xs font-medium text-mute">{label}</span>
                  {href ? <a href={href}>{value}</a> : value}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-5 text-xs text-mute">
        © {new Date().getFullYear()} GAIJIN SUSHI. {t('footer.rights')}
      </p>
    </footer>
  );
}
