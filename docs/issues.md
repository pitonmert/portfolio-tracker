<!--
ISSUES.MD - YAPAY ZEKA KULLANIM TALİMATLARI
============================================
Bu dosya, projenin resmi hata takip sistemidir. Bu dosyayla her etkileşimde
bu yorum bloğunu oku ve kuralları uygula.

## Amaç
Kod incelemesi veya analiz sırasında tespit edilen hataları, kod kalitesi
sorunlarını, güvenlik açıklarını ve mimari sorunları takip et. Her sorun,
aşağıdaki şablona uygun olmalıdır.

## Tek Doğruluk Kaynakları
- Görünen başlıktaki `# Sorunlar (N Açık)` değeri açık sorun sayısıdır.
- Sorun numarası, dosyada kullanılan en büyük `#N` değerinden bir artırılır.
- Sorunlar eklenme sırasına göre tutulur; önem derecesine göre yeniden sıralanmaz.
- Etiketler, sorunları filtrelemek için kullanılır; sıralama veya önem derecesi yerine geçmez.

## Dosya Yaşam Döngüsü Kuralları
- Mevcut sorunları ASLA silme, üzerine yazma, yeniden numaralandırma veya birleştirme.
- Açıkça talimat verilmedikçe mevcut sorunların içeriğini veya durumunu değiştirme.
- Yeni sorunları yalnızca `# Sorunlar` bölümünün en altına ekle.
- Yeni sorun eklediğinde başlıktaki açık sorun sayısını bir artır.
- Bir sorunun durumunu `Çözüldü` veya `Çözülmeyecek` yaptığında açık sorun sayısını bir azalt.
- Açık sorun sayısını güncellemeden önce yalnızca `# Sorunlar` bölümündeki gerçek
  sorun kayıtlarında bulunan `- **Durum:** Açık` alanlarını sayarak başlıktaki
  `N` değeriyle karşılaştır. Bu yorum bloğundaki şablon satırlarını sayıma dahil
  etme. Değişiklikten sonra sayımı tekrar doğrula.
- Durum değişikliği yapılan sorunun altına kısa bir `Çözüm Notu` ekle.

## Sorun Ne Zaman Eklenir
Şu durumlarda yeni sorun ekle:
- Kod hatası, mantık hatası veya çalışma zamanı riski.
- Güvenlik açığı: eksik kimlik doğrulama, yetkilendirme hatası, enjeksiyon riski,
  açığa çıkmış sırlar veya hassas veri sızıntısı.
- Bakım yapılabilirliği anlamlı ölçüde etkileyen kod kalitesi sorunu.
- Sağlanan kodda gözlemlenen yerleşik kalıplara aykırı mimari tutarsızlık.

Şu durumlar için sorun ekleme:
- İşlevsel etkisi olmayan küçük stil tercihleri.
- Kodda doğrudan kanıtı olmayan spekülatif sorunlar.
- Bu dosyada zaten açık olarak takip edilen konular.

## Sorun Şablonu
Yeni sorun eklerken aşağıdaki biçimi kullan:

## #N - [Kısa, açıklayıcı başlık]
- **Önem Derecesi:** Kritik | Yüksek | Orta | Düşük
- **Durum:** Açık
- **Etiketler:** [Katman], [Tür]
- **Bağımlılıklar:** Yok | #N
- **Konum:** `dosya/yolu/dosya.uzantı` · `[Sınıf / Modül / Bölüm]` · `[Metod / Fonksiyon / Alan]` · L[satır] — uygulanamayan segmentler atlanabilir
- **Açıklama:** Sorunun ne olduğunu ve neden önemli olduğunu açıkla. `Mevcut Durum`
  alanındaki kodu tekrar etme.
- **Mevcut Durum:**
```dil
// Sorunlu kod, yapılandırma değeri veya mevcut davranış.
```
- **Önerilen Eylem:**
```dil
// Somut ve uygulanabilir düzeltme. Kod yazılıyorsa geçerli ve çalışır olmalı.
// Araç veya yapılandırma gerekiyorsa tam adımları ya da komutları belirt.
```

## Sorun Durumu Nasıl Güncellenir
Bir sorunun durumunu yalnızca açık talimat aldığında değiştir. Güncellerken
`Durum` alanını uygun değere çek. `Çözüldü` veya `Çözülmeyecek` yapılan her
sorun için `# Sorunlar (N Açık)` başlığındaki açık sorun sayısını bir azalt ve
sorunun en altına şu alanı ekle:
- **Çözüm Notu:** [Ne yapıldı veya neden çözülmeyecek - kısa açıklama]

## Etiket Değerleri
- Katman: `Backend` · `Frontend` · `Veritabanı` · `DevOps` · `Test` · `Dokümantasyon` · `Genel`
- Tür: `Bug` · `Güvenlik` · `Refactor` · `Performans` · `Bakım` · `Mimari`

## Önem Derecesi
- `Kritik`: Veri kaybı, güvenlik ihlali veya sistem çökmesi riski. Hemen düzeltilmeli.
- `Yüksek`: Önemli işlevsel hata veya güvenlik açığı. Bir sonraki sürümden önce düzeltilmeli.
- `Orta`: Engelleyici olmayan ama anlamlı sorun. Yakın çalışmada düzeltilmeli.
- `Düşük`: Etkisi az olan küçük sorun. Uygun olduğunda düzeltilmeli.

## Durum Değerleri
`Açık` · `Devam Ediyor` · `Çözüldü` · `Çözülmeyecek`
-->

# Sorunlar (3 Açık)

## #1 - Asset çözümleme davranışı servisler arasında tutarsız
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** Backend, Mimari
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Transactions/TransactionService.cs` · `ResolveAssetAsync` · L144 · `PortfolioTracker.API/Features/MarketPrices/MarketPriceService.cs` · `SelectPreferredAsset` · L462
- **Açıklama:** Transaction akışı aynı sembolle birden fazla asset bulduğunda kullanıcıdan `AssetId` ile netleştirme istiyor; market price akışı ise aynı durumda sembol uzunluğu ve asset tipine göre sessizce tercih yapıyor. Ayrıca custom asset oluşturma mantığı hem transaction hem market price servislerinde yer alıyor. Bu da aynı sembol için işlem, manuel fiyat ve fiyat sorgusu davranışlarının farklı asset'e bağlanmasına yol açabilir.
- **Mevcut Durum:**
```csharp
// TransactionService
if (matches.Count > 1)
    throw new ArgumentException(
        "Bu sembol birden fazla varlıkla eşleşiyor. Listeden seçim yap."
    );

// MarketPriceService
var preferredAsset =
    normalizedSymbol.Length == 3
        ? assets.FirstOrDefault(asset => asset.AssetType == "fund")
        : assets.FirstOrDefault(asset => asset.AssetType == "stock");

return preferredAsset ?? assets.FirstOrDefault(asset => asset.IsCustom) ?? assets[0];
```
- **Önerilen Eylem:**
```text
Asset çözümleme ve custom asset oluşturma tek bir AssetResolver/AssetService benzeri bileşene taşınmalı. Symbol-only isteklerde uygulanacak tercih kuralı tek yerde tanımlanmalı; gerçekten belirsiz durumda tüm çağrılar aynı şekilde 400/log/explicit AssetId davranışını kullanmalı.
```

## #2 - Asset arama transaction tablosunu bellekte gruplayabiliyor
- **Önem Derecesi:** Düşük
- **Durum:** Açık
- **Etiketler:** Backend, Performans
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Assets/AssetSearchService.cs` · `GetTransactionSummariesAsync` · L106
- **Açıklama:** Asset arama akışı, sonuçları açık pozisyon ve son kullanım bilgisiyle sıralamak için tüm transaction kayıtlarını `ToListAsync` ile belleğe çekip sonrasında grupluyor. Kişisel portföy ölçeğinde kabul edilebilir olsa da arama isteği sık çalıştığı için veri büyüdükçe gecikme ve bellek maliyeti artabilir. Fiyat yenileme akışı artık aktif sembolleri `PortfolioPositions` read model üzerinden okuduğu için bu sorun market price refresh tarafını kapsamıyor.
- **Mevcut Durum:**
```csharp
var transactions = await context
    .Transactions.AsNoTracking()
    .Include(transaction => transaction.Asset)
    .OrderBy(transaction => transaction.Date)
    .ThenBy(transaction => transaction.Id)
    .ToListAsync(cancellationToken);

return transactions
    .GroupBy(transaction => transaction.AssetId)
    .Select(PortfolioCalculations.CalculateTransactionSummary)
    .ToList();
```
- **Önerilen Eylem:**
```text
Kısa vadede yalnızca gerekli transaction alanları select edilmeli veya asset arama için kısa süreli cache kullanılmalı. Orta vadede açık pozisyon ve son kullanım bilgisi `PortfolioPositions` read model ya da ayrı bir lightweight lookup üzerinden alınmalı.
```

## #3 - PortfolioSettings oluşturulurken Race Condition (yarış durumu) oluşabilir
- **Önem Derecesi:** Düşük
- **Durum:** Açık
- **Etiketler:** Backend, Bug
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Portfolio/PortfolioService.cs` · `GetSettingsAsync` · L83
- **Açıklama:** Veritabanında henüz ayar kaydı yokken, eşzamanlı gelen iki istek aynı anda `settings is not null` kontrolünden geçemeyip iki farklı kayıt oluşturabilir. `OrderBy(settings => settings.Id).FirstOrDefaultAsync()` ile ilk kayıt dönülse bile gereksiz veritabanı büyümesi ve potansiyel veri karışıklığı riski vardır.
- **Mevcut Durum:**
```csharp
var settings = await context
    .PortfolioSettings.OrderBy(settings => settings.Id)
    .FirstOrDefaultAsync(cancellationToken);
if (settings is not null)
    return settings;

settings = new PortfolioSettings { CashBalance = 0m, UpdatedAt = DateTime.UtcNow };
await context.PortfolioSettings.AddAsync(settings, cancellationToken);
await context.SaveChangesAsync(cancellationToken);
```
- **Önerilen Eylem:**
```text
PortfolioSettings tablosunda tek kayıt kısıtlaması (örneğin Singleton bir primary key veya unique index) uygulanmalı ve `SaveChangesAsync` bloğu sırasında `DbUpdateException` (unique violation) yönetilmeli ya da Upsert (Merge) yapısı kurulmalı.
```
