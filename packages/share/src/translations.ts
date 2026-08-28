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
  /** @deprecated Ya no se usa: el botón Nostr sigue el patrón "Share on {network}".
   *  Se mantiene la clave para no romper el tipo `Translation` exportado. */
  copyLink: string;
  /** Anunciado por aria-live cuando se copia algo. */
  copied: string;
  /** Prompt fallback cuando clipboard no disponible. */
  copyPrompt: string;
  /** Diálogo de instancia Mastodon: título. */
  maTitle: string;
  /** Diálogo de instancia Mastodon: explicación. */
  maDesc: string;
  /** Diálogo de instancia Mastodon: etiqueta del campo. */
  maLabel: string;
  /** Diálogo de instancia Mastodon: placeholder del campo. */
  maPlaceholder: string;
  /** Diálogo de instancia Mastodon: botón compartir. */
  maShare: string;
  /** Diálogo de instancia Mastodon: botón cancelar. */
  maCancel: string;
  /** Diálogo de instancia Mastodon: error de instancia inválida. */
  maError: string;
}

const DICT: Readonly<Record<LocaleCode, Translation>> = {
  en: {
    share: 'SHARE', by: 'by',
    shareOn: (n) => `Share on ${n}`,
    shareEmail: 'Share by email',
    copyLink: 'Copy link to clipboard',
    copied: 'Copied to clipboard',
    copyPrompt: 'Copy this:',
    maTitle: 'Share on Mastodon',
    maDesc: 'Mastodon is decentralized, so tell us your instance. We remember it on this device only.',
    maLabel: 'Your Mastodon instance',
    maPlaceholder: 'e.g. mastodon.social',
    maShare: 'Share',
    maCancel: 'Cancel',
    maError: 'Please enter a valid instance, like mastodon.social',
  },
  es: {
    share: 'COMPARTIR', by: 'por',
    shareOn: (n) => `Compartir en ${n}`,
    shareEmail: 'Compartir por email',
    copyLink: 'Copiar enlace al portapapeles',
    copied: 'Copiado al portapapeles',
    copyPrompt: 'Copia esto:',
    maTitle: 'Compartir en Mastodon',
    maDesc: 'Mastodon es descentralizado, dinos tu instancia. La recordamos solo en este dispositivo.',
    maLabel: 'Tu instancia de Mastodon',
    maPlaceholder: 'ej. mastodon.social',
    maShare: 'Compartir',
    maCancel: 'Cancelar',
    maError: 'Introduce una instancia válida, como mastodon.social',
  },
  it: {
    share: 'CONDIVIDI', by: 'da',
    shareOn: (n) => `Condividi su ${n}`,
    shareEmail: 'Condividi via email',
    copyLink: 'Copia il link negli appunti',
    copied: 'Copiato negli appunti',
    copyPrompt: 'Copia questo:',
    maTitle: 'Condividi su Mastodon',
    maDesc: 'Mastodon è decentralizzato, indica la tua istanza. La ricordiamo solo su questo dispositivo.',
    maLabel: 'La tua istanza Mastodon',
    maPlaceholder: 'es. mastodon.social',
    maShare: 'Condividi',
    maCancel: 'Annulla',
    maError: 'Inserisci una istanza valida, come mastodon.social',
  },
  nl: {
    share: 'DELEN', by: 'door',
    shareOn: (n) => `Deel op ${n}`,
    shareEmail: 'Per e-mail delen',
    copyLink: 'Link kopiëren naar klembord',
    copied: 'Gekopieerd naar klembord',
    copyPrompt: 'Kopieer dit:',
    maTitle: 'Deel op Mastodon',
    maDesc: 'Mastodon is gedecentraliseerd, geef je server op. We onthouden die alleen op dit apparaat.',
    maLabel: 'Je Mastodon-server',
    maPlaceholder: 'bijv. mastodon.social',
    maShare: 'Delen',
    maCancel: 'Annuleren',
    maError: 'Voer een geldige server in, zoals mastodon.social',
  },
  de: {
    share: 'TEILEN', by: 'von',
    shareOn: (n) => `Auf ${n} teilen`,
    shareEmail: 'Per E-Mail teilen',
    copyLink: 'Link in die Zwischenablage kopieren',
    copied: 'In die Zwischenablage kopiert',
    copyPrompt: 'Dies kopieren:',
    maTitle: 'Auf Mastodon teilen',
    maDesc: 'Mastodon ist dezentral, nenne deine Instanz. Wir merken sie uns nur auf diesem Gerät.',
    maLabel: 'Deine Mastodon-Instanz',
    maPlaceholder: 'z. B. mastodon.social',
    maShare: 'Teilen',
    maCancel: 'Abbrechen',
    maError: 'Bitte gib eine gültige Instanz ein, wie mastodon.social',
  },
  pt: {
    share: 'PARTILHAR', by: 'por',
    shareOn: (n) => `Partilhar no ${n}`,
    shareEmail: 'Partilhar por email',
    copyLink: 'Copiar ligação para a área de transferência',
    copied: 'Copiado para a área de transferência',
    copyPrompt: 'Copiar isto:',
    maTitle: 'Partilhar no Mastodon',
    maDesc: 'O Mastodon é descentralizado, indica a tua instância. Guardamo-la apenas neste dispositivo.',
    maLabel: 'A tua instância Mastodon',
    maPlaceholder: 'ex. mastodon.social',
    maShare: 'Partilhar',
    maCancel: 'Cancelar',
    maError: 'Indica uma instância válida, como mastodon.social',
  },
  gn: {
    share: 'MOASÃI', by: 'por',
    shareOn: (n) => `Emoasãi ${n}-pe`,
    shareEmail: 'Emoasãi email rupive',
    copyLink: 'Ekopia link portapapeles-pe',
    copied: 'Oñekopia portapapeles-pe',
    copyPrompt: 'Ekopia kóva:',
    maTitle: 'Emoasãi Mastodon-pe',
    maDesc: 'Mastodon descentralizado, ere ne instancia. Roñongatu ko dispositivo-pe añoite.',
    maLabel: 'Ne instancia Mastodon',
    maPlaceholder: 'techapyrã mastodon.social',
    maShare: 'Emoasãi',
    maCancel: 'Ehejarei',
    maError: 'Emoinge peteĩ instancia oĩporãva, mastodon.social-icha',
  },
  sv: {
    share: 'DELA', by: 'av',
    shareOn: (n) => `Dela på ${n}`,
    shareEmail: 'Dela via e-post',
    copyLink: 'Kopiera länk till urklipp',
    copied: 'Kopierat till urklipp',
    copyPrompt: 'Kopiera detta:',
    maTitle: 'Dela på Mastodon',
    maDesc: 'Mastodon är decentraliserat, ange din instans. Vi kommer ihåg den bara på den här enheten.',
    maLabel: 'Din Mastodon-instans',
    maPlaceholder: 't.ex. mastodon.social',
    maShare: 'Dela',
    maCancel: 'Avbryt',
    maError: 'Ange en giltig instans, som mastodon.social',
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
