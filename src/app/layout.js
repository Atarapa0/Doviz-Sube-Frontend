import "./globals.css";

export const metadata = {
  title: "Döviz Şube",
  description: "Banka şubesi döviz alım satım arayüzü",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
