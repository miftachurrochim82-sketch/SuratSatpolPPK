/**
 * Bantuan aksesibilitas untuk lapisan modal.
 *
 * Dipakai bersama oleh DetailModal, FormModal, dan QrModal supaya aturannya
 * hanya ditulis sekali dan tidak berbeda antar modal.
 */

const PILIH_FOKUS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** Elemen-elemen yang bisa menerima fokus di dalam wadah. */
export function elemenFokus(wadah: HTMLElement | null): HTMLElement[] {
  if (!wadah) return [];
  return Array.from(wadah.querySelectorAll<HTMLElement>(PILIH_FOKUS)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Putar fokus di dalam modal: Tab dari elemen terakhir kembali ke elemen pertama,
 * Shift+Tab dari elemen pertama lompat ke elemen terakhir.
 * Tanpa ini, pengguna papan ketik bisa "keluar" ke halaman di balik modal.
 */
export function tahanFokus(event: KeyboardEvent, wadah: HTMLElement | null) {
  if (event.key !== "Tab") return;

  const bisa = elemenFokus(wadah);
  if (bisa.length === 0) return;

  const pertama = bisa[0];
  const terakhir = bisa[bisa.length - 1];

  if (event.shiftKey && document.activeElement === pertama) {
    event.preventDefault();
    terakhir.focus();
  } else if (!event.shiftKey && document.activeElement === terakhir) {
    event.preventDefault();
    pertama.focus();
  }
}

/** Fokuskan elemen pertama yang masuk akal saat modal dibuka. */
export function fokuskanPertama(wadah: HTMLElement | null) {
  const bisa = elemenFokus(wadah);
  if (bisa.length > 0) bisa[0].focus();
}

/** Kunci gulir halaman selama modal terbuka; kembalikan fungsi pembersihnya. */
export function kunciGulir(): () => void {
  const semula = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = semula;
  };
}
