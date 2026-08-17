"use client";

import ErrorPanel from "@/components/errors/ErrorPanel";
import AppShell from "@/components/layout/AppShell";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  return (
    <AppShell>
      <ErrorPanel
        status={500}
        hataKodu="FRONTEND_HATASI"
        mesaj="Sayfa görüntülenirken beklenmeyen bir hata oluştu."
        correlationId={error.digest}
        onRetry={unstable_retry}
      />
    </AppShell>
  );
}

