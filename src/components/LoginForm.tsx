"use client";

import { useActionState, useState } from "react";
import { login } from "@/actions/auth";
import { EMPTY_STATE } from "@/lib/action-state";
import { IconAlert, IconEye, IconLock, IconUsers } from "@/components/Icons";

export default function LoginForm({ next = "/" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, EMPTY_STATE);
  const [lihatSandi, setLihatSandi] = useState(false);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, textAlign: "left" }}>
      <input type="hidden" name="next" value={next} />

      {state.message ? (
        <p className="notification-note" role="alert">
          <IconAlert size={14} />
          <span>{state.message}</span>
        </p>
      ) : null}

      <label className="field">
        <span>Nama pengguna</span>
        <div className="search-field" style={{ maxWidth: "none", height: 40 }}>
          <IconUsers size={14} />
          <input
            name="username"
            required
            autoFocus
            autoComplete="username"
            placeholder="admin"
            style={{ fontSize: 12 }}
          />
        </div>
      </label>

      <label className="field">
        <span>Kata sandi</span>
        <div className="search-field" style={{ maxWidth: "none", height: 40 }}>
          <IconLock size={14} />
          <input
            name="password"
            type={lihatSandi ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ fontSize: 12 }}
          />
          <button
            type="button"
            onClick={() => setLihatSandi((nilai) => !nilai)}
            aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            style={{
              border: 0,
              background: "transparent",
              color: lihatSandi ? "#3a82d1" : "#90a0b0",
              padding: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <IconEye size={14} />
          </button>
        </div>
      </label>

      <button type="submit" className="button primary full-button" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
