// Heredado del plugin WP oksigenia-access v16.9.
// 8 locales: español PY (con Guaraní separado como lengua oficial PY),
// inglés, francés, italiano, alemán, neerlandés, sueco.

export type LocaleCode = 'es' | 'gn' | 'en' | 'fr' | 'it' | 'de' | 'nl' | 'sv';

export interface Translation {
  title: string;
  close: string;
  txt: string;
  size: string;
  lh: string;
  align: string;
  font: string;
  dyslexia: string;
  vis: string;
  contrast: string;
  gray: string;
  hide: string;
  links: string;
  ori: string;
  guide: string;
  mask: string;
  targets: string;
  cursor: string;
  pause: string;
  reset: string;
  dev: string;
  ls: string;
  cb: string;
  focus: string;
  /** Section title for the preset row. */
  presets: string;
  /** Preset labels. */
  pLow: string;
  pDys: string;
  pMot: string;
  pCalm: string;
  /** aria-label de un control multinivel activo: (etiqueta, nivel n, máximo m).
   *  Solo se aplica cuando n > 0; en n = 0 el botón usa su etiqueta a secas. */
  level: (label: string, n: number, m: number) => string;
}

const DICT: Readonly<Record<LocaleCode, Translation>> = {
  es: { title: 'Accesibilidad', close: 'Cerrar', txt: 'Texto', size: 'Tamaño', lh: 'Interlineado', align: 'Alineación', font: 'Legible', dyslexia: 'Fuente Dislexia', vis: 'Visual', contrast: 'Contraste', gray: 'Grises', hide: 'Ocultar Img', links: 'Links', ori: 'Orientación', guide: 'Guía', mask: 'Máscara', targets: 'Áreas Grandes', cursor: 'Cursor Grande', pause: 'Parar Animac.', reset: 'Restablecer Todo', dev: 'Desarrollado por', ls: 'Espaciado', cb: 'Daltonismo', focus: 'Foco', presets: 'Perfiles', pLow: 'Baja Visión', pDys: 'Dislexia', pMot: 'Motor', pCalm: 'Sin Distrac.', level: (l, n, m) => `${l}, nivel ${n} de ${m}` },
  en: { title: 'Accessibility', close: 'Close', txt: 'Text', size: 'Size', lh: 'Line Height', align: 'Align', font: 'Readable Font', dyslexia: 'Dyslexia Font', vis: 'Visual', contrast: 'Contrast', gray: 'Grayscale', hide: 'Hide Images', links: 'Highlight Links', ori: 'Orientation', guide: 'Reading Guide', mask: 'Reading Mask', targets: 'Big Targets', cursor: 'Big Cursor', pause: 'Pause Anim.', reset: 'Reset All', dev: 'Developed by', ls: 'Letter Spacing', cb: 'Color Blind', focus: 'Focus', presets: 'Profiles', pLow: 'Low Vision', pDys: 'Dyslexia', pMot: 'Motor', pCalm: 'No Distract.', level: (l, n, m) => `${l}, level ${n} of ${m}` },
  gn: { title: 'Oikeha (Accesibilidad)', close: 'Mboty', txt: "Moñe'ẽrã", size: 'Tuichakue', lh: 'Jei', align: 'Mbojoja', font: 'Letra Porã', dyslexia: 'Dislexia', vis: 'Hechapy', contrast: "Sa'y", gray: 'Hũ ha Tĩ', hide: "Mokañy Ta'anga", links: 'Joajuha', ori: 'Sãmbyhy', guide: 'Sãmbyhyha', mask: "Mbohovái", targets: 'Tenda Guasu', cursor: 'Cursor Guasu', pause: 'Mboopyta', reset: 'Mbojevy', dev: 'Apojare', ls: 'Rapykue', cb: "Sa'yvy", focus: 'Ñemoha', presets: 'Tekorã', pLow: 'Hechapy Vai', pDys: 'Dislexia', pMot: 'Po-rehegua', pCalm: 'Pyʼa Guapy', level: (l, n, m) => `${l}, ${n}/${m}` },
  fr: { title: 'Accessibilité', close: 'Fermer', txt: 'Texte', size: 'Taille', lh: 'Interligne', align: 'Alignement', font: 'Police Lisible', dyslexia: 'Police Dyslexie', vis: 'Visuel', contrast: 'Contraste', gray: 'Niveaux Gris', hide: 'Masquer Img', links: 'Liens', ori: 'Orientation', guide: 'Guide Lecture', mask: 'Masque Lecture', targets: 'Grandes Cibles', cursor: 'Grand Curseur', pause: 'Pause Anim.', reset: 'Réinitialiser', dev: 'Développé par', ls: 'Espacement', cb: 'Daltonisme', focus: 'Focus', presets: 'Profils', pLow: 'Basse Vision', pDys: 'Dyslexie', pMot: 'Moteur', pCalm: 'Sans Distrac.', level: (l, n, m) => `${l}, niveau ${n} sur ${m}` },
  it: { title: 'Accessibilità', close: 'Chiudi', txt: 'Testo', size: 'Dimensione', lh: 'Interlinea', align: 'Allineamento', font: 'Leggibile', dyslexia: 'Font Dislessia', vis: 'Visivo', contrast: 'Contrasto', gray: 'Scala Grig.', hide: 'Nascondi Img', links: 'Link', ori: 'Orientamento', guide: 'Guida', mask: 'Maschera', targets: 'Aree Grandi', cursor: 'Cursore Grande', pause: 'Pausa Anim.', reset: 'Reimposta', dev: 'Sviluppato da', ls: 'Spaziatura', cb: 'Daltonismo', focus: 'Focus', presets: 'Profili', pLow: 'Ipovisione', pDys: 'Dislessia', pMot: 'Motorio', pCalm: 'No Distraz.', level: (l, n, m) => `${l}, livello ${n} di ${m}` },
  de: { title: 'Barrierefreiheit', close: 'Schließen', txt: 'Text', size: 'Größe', lh: 'Zeilenhöhe', align: 'Ausrichtung', font: 'Lesbar', dyslexia: 'Dyslexie', vis: 'Visuell', contrast: 'Kontrast', gray: 'Graustufen', hide: 'Bilder Aus', links: 'Links', ori: 'Orientierung', guide: 'Lesehilfe', mask: 'Lesemaske', targets: 'Große Ziele', cursor: 'Großer Cursor', pause: 'Anim. Stopp', reset: 'Zurücksetzen', dev: 'Entwickelt von', ls: 'Buchst.abst.', cb: 'Farbblindheit', focus: 'Fokus', presets: 'Profile', pLow: 'Sehschwäche', pDys: 'Dyslexie', pMot: 'Motorik', pCalm: 'Ohne Ablenk.', level: (l, n, m) => `${l}, Stufe ${n} von ${m}` },
  nl: { title: 'Toegankelijkheid', close: 'Sluiten', txt: 'Tekst', size: 'Grootte', lh: 'Regelhoogte', align: 'Uitlijning', font: 'Leesbaar', dyslexia: 'Dyslexie', vis: 'Visueel', contrast: 'Contrast', gray: 'Grijstinten', hide: 'Verberg Afb.', links: 'Links', ori: 'Oriëntatie', guide: 'Leesgids', mask: 'Leesmasker', targets: 'Grote Doelen', cursor: 'Grote Cursor', pause: 'Anim. Pauze', reset: 'Resetten', dev: 'Ontwikkeld door', ls: 'Letterspatie', cb: 'Kleurenblind', focus: 'Focus', presets: 'Profielen', pLow: 'Slechtziend', pDys: 'Dyslexie', pMot: 'Motoriek', pCalm: 'Geen Afleid.', level: (l, n, m) => `${l}, niveau ${n} van ${m}` },
  sv: { title: 'Tillgänglighet', close: 'Stäng', txt: 'Text', size: 'Storlek', lh: 'Radhöjd', align: 'Justering', font: 'Läsbar', dyslexia: 'Dyslexi', vis: 'Visuell', contrast: 'Kontrast', gray: 'Gråskala', hide: 'Dölj Bilder', links: 'Länkar', ori: 'Orientering', guide: 'Läslinjal', mask: 'Läsmask', targets: 'Stora Ytor', cursor: 'Stor Markör', pause: 'Pausa Anim.', reset: 'Återställ', dev: 'Utvecklad av', ls: 'Bokstavsavst.', cb: 'Färgblindhet', focus: 'Fokus', presets: 'Profiler', pLow: 'Synnedsätt.', pDys: 'Dyslexi', pMot: 'Motorik', pCalm: 'Inga Distrak.', level: (l, n, m) => `${l}, nivå ${n} av ${m}` },
};

export function getTranslation(locale: string): Translation {
  const lc = locale.toLowerCase();
  if (lc === 'gn' || lc.startsWith('gn-') || lc.startsWith('gn_')) return DICT.gn;
  const base = lc.split(/[-_]/)[0] as LocaleCode;
  return DICT[base] ?? DICT.en;
}

export function supportedLocales(): readonly LocaleCode[] {
  return Object.keys(DICT) as LocaleCode[];
}
