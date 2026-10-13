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

echo "==> 2. Memeriksa izin tulis ke repo"
PERM=$(curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" \
              -H "Accept: application/vnd.github+json" \
              https://api.github.com/repos/miftachurrochim82-sketch/SuratSatpolPPK \
       | sed -n 's/.*"push"[[:space:]]*:[[:space:]]*\(true\|false\).*/\1/p' | head -1)

if [[ "$PERM" != "true" ]]; then
  echo "    PERINGATAN: API melaporkan izin push = '${PERM:-tidak diketahui}'."
  echo "    Kalau push gagal, pastikan token punya izin Contents: Read and write."
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
