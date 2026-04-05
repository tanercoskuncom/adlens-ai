#!/bin/bash

# AdLens AI — Supabase Veritabanı Kurulum Scripti
# Kullanım: bash scripts/setup-db.sh

echo ""
echo "==================================="
echo "  AdLens AI — Veritabanı Kurulumu"
echo "==================================="
echo ""

# .env.local kontrolü
if [ ! -f .env.local ]; then
  echo "HATA: .env.local dosyası bulunamadı!"
  echo "Proje kök dizininde çalıştırın."
  exit 1
fi

# DATABASE_URL kontrolü
DB_URL=$(grep "^DATABASE_URL=" .env.local | head -1 | cut -d'"' -f2)

if [[ "$DB_URL" == *"XXXX"* ]] || [[ "$DB_URL" == *"localhost"* ]] || [[ -z "$DB_URL" ]]; then
  echo "⚠  DATABASE_URL henüz ayarlanmamış."
  echo ""
  echo "Supabase kurulumu:"
  echo "  1. https://supabase.com adresine gidin"
  echo "  2. Yeni proje oluşturun"
  echo "  3. Settings → Database → Connection string"
  echo "  4. 'Transaction' (port 6543) URL'ini DATABASE_URL'e yapıştırın"
  echo "  5. 'Session' (port 5432) URL'ini DIRECT_URL'e yapıştırın"
  echo ""
  echo ".env.local dosyasını güncelledikten sonra tekrar çalıştırın."
  exit 1
fi

echo "✓ DATABASE_URL bulundu"
echo ""

# Prisma generate
echo "→ Prisma Client oluşturuluyor..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "HATA: Prisma generate başarısız!"
  exit 1
fi
echo "✓ Prisma Client hazır"
echo ""

# Prisma db push (migration)
echo "→ Veritabanı şeması gönderiliyor..."
npx prisma db push
if [ $? -ne 0 ]; then
  echo "HATA: Veritabanı şeması gönderilemedi!"
  echo "DATABASE_URL ve DIRECT_URL'i kontrol edin."
  exit 1
fi
echo "✓ Veritabanı şeması oluşturuldu"
echo ""

# NEXTAUTH_SECRET kontrolü
SECRET=$(grep "^NEXTAUTH_SECRET=" .env.local | head -1 | cut -d'"' -f2)
if [[ "$SECRET" == "buraya-gizli-bir-key-yaz" ]] || [[ -z "$SECRET" ]]; then
  echo "→ NEXTAUTH_SECRET oluşturuluyor..."
  NEW_SECRET=$(openssl rand -base64 32)
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s|NEXTAUTH_SECRET=\"buraya-gizli-bir-key-yaz\"|NEXTAUTH_SECRET=\"$NEW_SECRET\"|g" .env.local
  else
    sed -i "s|NEXTAUTH_SECRET=\"buraya-gizli-bir-key-yaz\"|NEXTAUTH_SECRET=\"$NEW_SECRET\"|g" .env.local
  fi
  echo "✓ NEXTAUTH_SECRET otomatik oluşturuldu"
else
  echo "✓ NEXTAUTH_SECRET mevcut"
fi

echo ""
echo "==================================="
echo "  Kurulum tamamlandı!"
echo "==================================="
echo ""
echo "Sonraki adımlar:"
echo "  1. npm run dev"
echo "  2. http://localhost:3000/register adresinden kayıt olun"
echo "  3. Dashboard'a girin ve analiz yapmaya başlayın"
echo ""
echo "Opsiyonel:"
echo "  npx prisma studio  → Veritabanını görsel olarak yönetin"
echo ""
