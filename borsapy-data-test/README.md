# borsapy Data Test

Bu klasor, PortfolioTracker asset catalog tasarimi icin `borsapy` kaynaklarinin
hangi kolonlari ve veri tiplerini dondurdugunu arastirmak amaciyla tutulur.
Ana uygulama koduna bagli degildir.

## Test Edilen Kaynaklar

- `bp.companies()`
- `bp.search_companies("banka")`
- `bp.screen_stocks()`
- `bp.search_funds("banka", limit=10)`
- `bp.screen_funds(fund_type="YAT", limit=5000)`
- `bp.screen_funds(fund_type="EMK", limit=5000)`
- `bp.Ticker("THYAO").fast_info`
- `bp.Ticker("THYAO").info`
- `bp.Fund("KPA").info`
- Hata raporlama ornegi icin `bp.Fund("AAK").info`

## Lokal Calistirma

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python probe_borsapy_assets.py
```

## Docker ile Calistirma

Mevcut `market-data-service` image'i `borsapy` bagimliligini zaten icerir.
Kok dizinden su komut calistirilabilir:

```bash
docker compose run --rm --no-deps \
  -v /Users/pitonmert/GitHub/budget-tracking/borsapy-data-test:/work \
  -w /work \
  market-data-service \
  python probe_borsapy_assets.py
```

## Ciktilar

- `RESULTS.md`: okunabilir rapor.
- `outputs/latest-summary.json`: makine tarafindan okunabilir ozet.

Buyuk ham veri dosyalari saklanmaz. Sadece satir sayisi, kolonlar, anahtarlar,
ornek kayitlar ve hata bilgileri raporlanir.
