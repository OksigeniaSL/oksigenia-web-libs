// Heredado del plugin WP oksigenia-share v7.2.
// Diccionario in-source para evitar fetch en runtime.

export type LocaleCode = 'en' | 'es' | 'it' | 'nl' | 'de' | 'pt' | 'gn' | 'sv';

export interface Translation {
  /** Label "SHARE" en caps. */
  share: string;
  /** Conector "by" usado en el tweet "{title} by @user". */
  by: string;
  /** aria-label "Share on %s". %s se reemplaza con el nombre de red. */
  shareOn: (network: string) => string;
  /** aria-label del botón de email. */
  shareEmail: string;
  /** aria-label del botón Nostr (copy-only). */
  copyLink: string;
  /** Anunciado por aria-live cuando se copia algo. */
  copied: string;
  /** Prompt fallback cuando clipboard no disponible. */
  copyPrompt: string;
}

const DICT: Readonly<Record<LocaleCode, Translation>> = {
  en: {
    share: 'SHARE', by: 'by',
    shareOn: (n) => `Share on ${n}`,
    shareEmail: 'Share by email',
    copyLink: 'Copy link to clipboard',
    copied: 'Copied to clipboard',
    copyPrompt: 'Copy this:',
  },
  es: {
    share: 'COMPARTIR', by: 'por',
    shareOn: (n) => `Compartir en ${n}`,
    shareEmail: 'Compartir por email',
    copyLink: 'Copiar enlace al portapapeles',
    copied: 'Copiado al portapapeles',
    copyPrompt: 'Copia esto:',
  },
  it: {
    share: 'CONDIVIDI', by: 'da',
    shareOn: (n) => `Condividi su ${n}`,
    shareEmail: 'Condividi via email',
    copyLink: 'Copia il link negli appunti',
    copied: 'Copiato negli appunti',
    copyPrompt: 'Copia questo:',
  },
  nl: {
    share: 'DELEN', by: 'door',
    shareOn: (n) => `Deel op ${n}`,
    shareEmail: 'Per e-mail delen',
    copyLink: 'Link kopiëren naar klembord',
    copied: 'Gekopieerd naar klembord',
    copyPrompt: 'Kopieer dit:',
  },
  de: {
    share: 'TEILEN', by: 'von',
    shareOn: (n) => `Auf ${n} teilen`,
    shareEmail: 'Per E-Mail teilen',
    copyLink: 'Link in die Zwischenablage kopieren',
    copied: 'In die Zwischenablage kopiert',
    copyPrompt: 'Dies kopieren:',
  },
  pt: {
    share: 'PARTILHAR', by: 'por',
    shareOn: (n) => `Partilhar no ${n}`,
    shareEmail: 'Partilhar por email',
    copyLink: 'Copiar ligação para a área de transferência',
    copied: 'Copiado para a área de transferência',
    copyPrompt: 'Copiar isto:',
  },
  gn: {
    share: 'MOASÃI', by: 'por',
    shareOn: (n) => `Emoasãi ${n}-pe`,
    shareEmail: 'Emoasãi email rupive',
    copyLink: 'Ekopia link portapapeles-pe',
    copied: 'Oñekopia portapapeles-pe',
    copyPrompt: 'Ekopia kóva:',
  },
  sv: {
    share: 'DELA', by: 'av',
    shareOn: (n) => `Dela på ${n}`,
    shareEmail: 'Dela via e-post',
    copyLink: 'Kopiera länk till urklipp',
    copied: 'Kopierat till urklipp',
    copyPrompt: 'Kopiera detta:',
  },
};

/**
 * Devuelve la traducción para un locale. Acepta variantes regionales:
 * `es-PY`, `es-ES`, `pt-BR` → todas caen al código base si existe.
 * Fallback final: `en`.
 */
export function getTranslation(locale: string): Translation {
  const base = locale.toLowerCase().split(/[-_]/)[0] as LocaleCode;
  return DICT[base] ?? DICT.en;
}

export function supportedLocales(): readonly LocaleCode[] {
  return Object.keys(DICT) as LocaleCode[];
}
