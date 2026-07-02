# Market Data Service

Internal market data provider service for PortfolioTracker. The frontend does not call this service directly; the PortfolioTracker API fetches prices through this service and stores them in its own `MarketPrices` table.

## Provider

This service uses [`borsapy`](https://github.com/saidsurucu/borsapy/) for market price and asset catalog data. Follow the upstream borsapy repository for installation details, usage notes, license terms, and provider terms.

## Endpoints

- `GET /health`
- `GET /quotes/{symbol}?assetType=auto|stock|fund`

Example response:

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

In Docker Compose, use `http://localhost:8001` from the host and `http://market-data-service:8000` from the service network.

## Tests

```bash
python3 -m pytest
```
