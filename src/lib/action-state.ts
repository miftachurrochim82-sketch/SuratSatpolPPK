/**
 * Bentuk hasil server action.
 *
 * Nilai ini sengaja ditaruh di luar berkas "use server" — berkas ber-"use server"
 * hanya boleh mengekspor fungsi async, jadi konstanta seperti EMPTY_STATE tidak
 * boleh tinggal di sana.
 */
export type ActionState = {
  ok: boolean;
  message: string;
};

export const EMPTY_STATE: ActionState = { ok: false, message: "" };

/**
 * Tanda tangan server action yang mengembalikan status.
 * Dipakai tombol "Simpan" pada formulir modal.
 */
export type ActionHandler = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;
