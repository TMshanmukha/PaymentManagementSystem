import logoImg from '../assets/vedavyas-logo.jpg';

/**
 * Static high-resolution crest image for VEDAVYAS E.M SCHOOL, GUNTAKAL.
 * Bundled as a static asset with eager loading and rounded-full framing.
 */
export function VedavyasLogo({ className = 'w-10 h-10', alt = 'Vedavyas E.M School Logo' }) {
  return (
    <img
      src={logoImg}
      alt={alt}
      loading="eager"
      decoding="sync"
      className={`rounded-full object-cover bg-white ${className}`}
    />
  );
}
