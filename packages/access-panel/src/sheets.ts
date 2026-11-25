// Stylesheets for the document and the shadow root.
//
// Constructable stylesheets are not subject to the host's `style-src`, while
// `<style>` elements and style attributes are. They are what lets the panel run
// under `style-src 'self'` with no hashes. Browsers without them (Safari before
// 16.4) get the same CSS in a `<style>`.

/** Builds a sheet that can be adopted by `doc` and its shadow roots, or null
 *  when the browser has no constructable stylesheets. A sheet only works in the
 *  document it was constructed for, hence the document's own constructor. */
export function createSheet(doc: Document, css: string): CSSStyleSheet | null {
  const Sheet = (doc.defaultView as (Window & typeof globalThis) | null)?.CSSStyleSheet;
  if (!Sheet || !('adoptedStyleSheets' in doc) || !('replaceSync' in Sheet.prototype)) return null;
  try {
    const sheet = new Sheet();
    sheet.replaceSync(css);
    return sheet;
  } catch {
    return null;
  }
}

/** A block of CSS applied to the whole document, replaceable in place. */
export class DocumentStyle {
  private sheet: CSSStyleSheet | null = null;
  private doc: Document | null = null;
  private element: HTMLStyleElement | null = null;
  private css: string | null = null;

  constructor(private readonly id: string) {}

  set(doc: Document, css: string): void {
    if (this.doc !== doc) {
      this.remove();
      this.doc = doc;
    }
    if (!this.sheet && !this.element) {
      this.sheet = createSheet(doc, css);
      if (this.sheet) this.css = css;
    }
    if (this.sheet) {
      if (this.css !== css) this.sheet.replaceSync(css);
      if (!doc.adoptedStyleSheets.includes(this.sheet)) {
        doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, this.sheet];
      }
    } else {
      if (!this.element) {
        this.element = doc.createElement('style');
        this.element.id = this.id;
      }
      this.element.textContent = css;
      if (!this.element.isConnected) doc.head.appendChild(this.element);
    }
    this.css = css;
  }

  remove(): void {
    const { sheet, doc } = this;
    if (sheet && doc) {
      doc.adoptedStyleSheets = doc.adoptedStyleSheets.filter((s) => s !== sheet);
    }
    this.element?.remove();
    this.sheet = null;
    this.element = null;
    this.css = null;
    this.doc = null;
  }
}
