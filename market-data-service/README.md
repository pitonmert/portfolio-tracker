# Market Data Service

PortfolioTracker için dahili fiyat sağlayıcı servisidir. Frontend bu servisi doğrudan çağırmaz; PortfolioTracker API, fiyatları bu servis üzerinden alır ve kendi `MarketPrices` tablosuna yazar.

## Provider

Bu servis fiyat ve varlık verileri için [`borsapy`](https://github.com/saidsurucu/borsapy/) kullanır. Kurulum, kullanım detayları ve lisans/kullanım koşulları için upstream borsapy reposunu takip et.

## Endpoints

- `GET /health`
- `GET /quotes/{symbol}?assetType=auto|stock|fund`

Örnek response:

```json
{
  "symbol": "THYAO",
  "assetType": "stock",
  "name": "Türk Hava Yolları",
  "currentPrice": 312.5,
  "currency": "TRY",
  "fetchedAt": "2026-06-22T12:30:00Z",
  "source": "borsapy",
  "isAvailable": true,
  "error": null
}
```

## Local Development

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Docker Compose içinde hosttan `http://localhost:8001`, servis ağından `http://market-data-service:8000` adresi kullanılır.

## Tests

```bash
python3 -m pytest
```
