# Döviz Şube

Banka şubesi personelinin döviz ve hesap işlemlerini yönetebilmesi için geliştirilen Next.js tabanlı web arayüzüdür. Uygulama; müşteri ve şube yönetimi, döviz alım-satımı, arbitraj, hesap hareketleri ve işlem geçmişi gibi işlemleri tek bir arayüzde toplar.

## Özellikler

- Güncel döviz alış ve satış kurlarını görüntüleme
- Döviz alış-satış işlemi gerçekleştirme
- Döviz hesapları arasında arbitraj hesaplama ve önizleme
- Müşteri arama, listeleme ve müşteri detaylarını görüntüleme
- Şube listeleme ve şube detaylarını görüntüleme
- Yeni müşteri, şube ve döviz hesabı oluşturma
- Hesap bakiyelerini ve hesap hareketlerini görüntüleme
- Döviz işlem geçmişini sayfalama ve filtrelerle inceleme
- İşlem detayını görüntüleme ve uygun işlemler için ters kayıt oluşturma
- API ve bağlantı hatalarını ortak bir hata ekranında yönetme

## Kullanılan Teknolojiler

- Next.js 16 ve App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui ve Base UI
- Lucide React ikonları
- Next.js Route Handlers
- Docker

Uygulama, ASP.NET Core Web API ile haberleşecek şekilde geliştirilmiştir. Backend tarafında sağlanan müşteri, şube, hesap, kur, döviz işlemi ve arbitraj endpointleri kullanılır.

## Mimari

Temel istek akışı aşağıdaki gibidir:

```text
Kullanıcı
  → Next.js sayfaları ve React bileşenleri
  → Frontend service katmanı
  → Next.js Route Handlers (/api/*)
  → ASP.NET Core Web API (/api/v1/*)
  → Veritabanı ve harici servisler
```

Tarayıcı, backend adresine doğrudan istek göndermez. İstekler önce aynı uygulamadaki `/api/*` Route Handler'larına ulaşır. Route Handler'lar, sunucu tarafındaki `API_BASE_URL` değişkenini kullanarak backend API'ye bağlanır.

Bu yaklaşım sayesinde:

- Backend adresi tarayıcı tarafında yayınlanmaz.
- API endpointleri merkezi olarak yönetilir.
- Backend hata cevapları ortak bir yapıya dönüştürülür.
- Frontend ile backend arasındaki iletişim tek noktadan kontrol edilir.

## Proje Yapısı

```text
src/
├── app/                  # Sayfalar ve Next.js Route Handler'ları
│   ├── api/              # Backend API'ye yönlendiren sunucu tarafı rotalar
│   ├── arbitraj/
│   ├── dashboard/
│   ├── doviz-islem-gecmisi/
│   ├── hesap-acma/
│   ├── hesap-hareketleri/
│   ├── musteriler/
│   └── subeler/
├── components/           # Tekrar kullanılabilir arayüz bileşenleri
├── constants/            # Frontend ve backend endpoint sabitleri
├── hooks/                # Özel React hook'ları
├── lib/                  # API, hata yönetimi ve yardımcı fonksiyonlar
├── reducers/             # Form state yönetimi
├── services/             # Sayfaların kullandığı API servisleri
└── types/                # TypeScript tipleri
```

## Kurulum

### Gereksinimler

- Node.js 22 önerilir
- npm
- Çalışır durumda bir backend API

Bağımlılıkları yükleyin:

```bash
npm install
```

Proje kökünde `.env.local` dosyası oluşturun:

```env
API_BASE_URL=http://localhost:5054
```

`API_BASE_URL` yalnızca sunucu tarafında kullanılır. Bu nedenle değişken adında `NEXT_PUBLIC_` öneki bulunmaz.

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Ardından uygulamayı tarayıcıda açın:

```text
http://localhost:3000
```

Port kullanımda olduğunda Next.js farklı bir port seçebilir. Terminalde gösterilen adres kullanılmalıdır.

## Komutlar

```bash
npm run dev      # Geliştirme sunucusunu başlatır
npm run build    # Üretim derlemesi oluşturur
npm run start    # Üretim derlemesini çalıştırır
npm run lint     # ESLint kontrollerini çalıştırır
```

## Docker ile Çalıştırma

Docker imajını oluşturun:

```bash
docker build -t doviz-sube .
```

Container'ı yerel backend adresiyle çalıştırın:

```bash
docker run --rm -p 3000:3000 \
  -e API_BASE_URL=http://host.docker.internal:5054 \
  doviz-sube
```

macOS ve Windows ortamlarında `host.docker.internal`, container'ın bilgisayarda çalışan backend servisine erişmesini sağlar.

## Hata Yönetimi

API cevapları ortak istemci ve sunucu yardımcıları üzerinden işlenir. Bağlantı hataları ve geçersiz API cevapları kullanıcı dostu mesajlara dönüştürülür. Kritik HTTP hatalarında uygulamanın genel yerleşimi korunur ve hata bilgisi içerik alanında gösterilir.

Desteklenen temel durumlar:

- `404`: İstenen kayıt veya kaynak bulunamadı
- `500`: Backend tarafında beklenmeyen hata
- `502`: Backend API'ye bağlanılamadı veya geçersiz cevap alındı
- `503`: Kullanılan servis geçici olarak kullanılamıyor
- `504`: API isteği zaman aşımına uğradı

Backend tarafından gönderilen hata kodu, hata kimliği ve correlation ID bilgileri mevcutsa hata ekranında gösterilir.
