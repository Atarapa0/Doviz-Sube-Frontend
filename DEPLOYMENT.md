# Dokploy ile yayınlama

Bu proje Next.js standalone Docker imajı olarak çalışır.

## Frontend ayarları

Dokploy uygulamasında:

- Build Type: `Dockerfile`
- Dockerfile Path: `Dockerfile`
- Container Port: `3000`
- Health Check Path: `/`

Runtime ortam değişkeni:

```env
API_BASE_URL=https://staj-api.furkanerdogan.com
```

Bu adres Docker imajında production varsayılanı olarak da tanımlıdır. Dokploy
ortam değişkeni verilirse varsayılan değerin üzerine yazılır.

`API_BASE_URL` server tarafında kullanılır. Tarayıcı gerçek backend adresine
doğrudan istek göndermez; frontend'in `/api/*` Route Handler'ları üzerinden
backend'e ulaşır.

## Backend ayarları

Backend yayına alındıktan sonra:

1. `staj-api.furkanerdogan.com` DNS kaydı Dokploy sunucusuna yönlendirilmelidir.
2. Dokploy üzerinden alan adı backend container'ına bağlanmalıdır.
3. HTTPS sertifikası etkinleştirilmelidir.
4. `https://staj-api.furkanerdogan.com/swagger/index.html` adresi kontrol edilmelidir.
5. Ardından frontend yeniden deploy edilmelidir.

## Yerel Docker kontrolü

```bash
docker build -t doviz-sube .
docker run --rm -p 3000:3000 \
  -e API_BASE_URL=http://host.docker.internal:5054 \
  doviz-sube
```

macOS ve Windows'ta container içerisinden bilgisayardaki backend'e ulaşmak için
`localhost` yerine `host.docker.internal` kullanılır.
