"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  onConfirm: (confirmed: boolean) => void;
  language?: "tr" | "en";
}

const TEXTS = {
  tr: "Yüklediğim dosyada kişisel veri (isim, e-posta, telefon numarası vb.) bulunmamaktadır. Yalnızca reklam performans metriklerini içerdiğini onaylıyorum.",
  en: "I confirm that the uploaded file does not contain personal data (name, email, phone number, etc.) and only includes advertising performance metrics.",
};

export function GDPRConsent({ onConfirm, language = "tr" }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <Checkbox
        id="gdpr"
        checked={checked}
        onCheckedChange={(v) => {
          const val = !!v;
          setChecked(val);
          onConfirm(val);
        }}
      />
      <label
        htmlFor="gdpr"
        className="text-sm text-amber-800 cursor-pointer leading-relaxed"
      >
        {TEXTS[language]}
      </label>
    </div>
  );
}
