#!/usr/bin/env bash
#
# push-ke-github.sh — kirim perbaikan repo SuratSatpolPPK ke GitHub
#
# Cara pakai (jalankan dari folder project):
#   GITHUB_TOKEN=ghp_xxxxxxxx ./push-ke-github.sh
#
# Token TIDAK ditulis ke URL git dan TIDAK masuk git reflog,
# jadi tidak akan bocor di riwayat atau pesan error.

set -euo pipefail

REPO_URL="https://github.com/miftachurrochim82-sketch/SuratSatpolPPK.git"
BRANCH="${BRANCH:-main}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "ERROR: variabel GITHUB_TOKEN belum diisi."
  echo
  echo "Jalankan seperti ini:"
  echo "  GITHUB_TOKEN=ghp_xxxxxxxx ./push-ke-github.sh"
  exit 1
fi

echo "==> 1. Memeriksa token ke GitHub API"
LOGIN=$(curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" \
               -H "Accept: application/vnd.github+json" \
               https://api.github.com/user \
        | sed -n 's/.*"login"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [[ -z "$LOGIN" ]]; then
  echo "    GAGAL: token tidak valid atau sudah kedaluwarsa."
  echo "    Pastikan token punya izin 'Contents: Read and write' untuk repo ini."
  exit 1
fi
echo "    OK — terautentikasi sebagai: $LOGIN"

echo "==> 2. Menguji izin TULIS token (bukan izin akun)"
HEAD_SHA=$(curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/miftachurrochim82-sketch/SuratSatpolPPK/git/refs/heads/main \
  | sed -n 's/.*"sha"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

WRITE_TEST=$(curl -sS -X POST -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/miftachurrochim82-sketch/SuratSatpolPPK/git/refs \
  -d "{\"ref\":\"refs/heads/uji-izin-tulis\",\"sha\":\"$HEAD_SHA\"}")

if grep -q '"ref"' <<<"$WRITE_TEST"; then
  echo "    OK — token punya izin Contents: Read and write"
  # bersihkan branch uji
  curl -sS -X DELETE -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/repos/miftachurrochim82-sketch/SuratSatpolPPK/git/refs/heads/uji-izin-tulis >/dev/null
  echo "    (branch uji sudah dibersihkan)"
else
  echo "    GAGAL: token TIDAK punya izin tulis."
  echo
  echo "    Akun Anda punya hak admin di repo ini, jadi masalahnya di setelan token."
  echo "    Perbaiki dengan salah satu cara:"
  echo
  echo "    --- Cara 1: betulkan token yang ada ---"
  echo "    Buka https://github.com/settings/tokens?type=beta"
  echo "    -> klik nama token -> Permissions -> Repository permissions"
  echo "    -> Contents: ubah jadi 'Read and write' -> Save changes"
  echo
  echo "    --- Cara 2: bikin token klasik (lebih cepat) ---"
  echo "    Buka https://github.com/settings/tokens/new"
  echo "    -> centang scope 'repo' -> Generate token"
  exit 1
fi

echo "==> 3. Apa yang akan dikirim"
git log --oneline "origin/$BRANCH..$BRANCH" 2>/dev/null || git log --oneline -1

echo "==> 4. Push ke $BRANCH"
git -c credential.helper='!f() { echo "username=x-access-token"; echo "password=$GITHUB_TOKEN"; }; f' \
    push origin "$BRANCH"

echo
echo "==> SELESAI. Perbaikan sudah terkirim ke GitHub."
echo "    Cek di: https://github.com/miftachurrochim82-sketch/SuratSatpolPPK"
echo
echo "    JANGAN LUPA: hapus token ini di https://github.com/settings/tokens"
