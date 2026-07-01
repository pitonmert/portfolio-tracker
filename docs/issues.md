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

# Sorunlar (8 Açık)

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

## #2 - Asset sync katalogdan düşen kayıtları pasifleştirmiyor
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** Backend, Bug
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Assets/AssetSyncService.cs` · `SyncAsync` · L10
- **Açıklama:** Senkronizasyon akışı sağlayıcıdan gelen kayıtları upsert edip `IsActive = true` yapıyor, ancak artık sağlayıcıdan dönmeyen katalog asset'lerini pasifleştirmiyor. Borsadan çıkan veya katalogdan kaldırılan bir varlık veritabanında aktif kalırsa arama sonuçlarında görünmeye devam eder.
- **Mevcut Durum:**
```csharp
foreach (var item in normalizedItems)
{
    // upsert
    asset.IsCustom = false;
    asset.IsActive = true;
    asset.LastSyncedAt = now;
}

await context.SaveChangesAsync(cancellationToken);
```
- **Önerilen Eylem:**
```text
Sync sonunda custom olmayan mevcut katalog asset'leri için bu sync içinde görülmeyen kayıtlar IsActive=false yapılmalı. Karar anahtarı mevcut unique key ile aynı olmalı: Symbol + AssetType + Market. Custom asset'ler pasifleştirme dışında bırakılmalı.
```

## #3 - Asset arama ve fiyat yenileme tüm transaction tablosunu bellekte gruplayabiliyor
- **Önem Derecesi:** Düşük
- **Durum:** Açık
- **Etiketler:** Backend, Performans
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Assets/AssetSearchService.cs` · `GetTransactionSummariesAsync` · L106 · `PortfolioTracker.API/Features/MarketPrices/MarketPriceService.cs` · `GetActiveSymbolsAsync` · L345
- **Açıklama:** Asset arama ve periyodik fiyat yenileme akışları, açık pozisyonları bulmak için tüm transaction kayıtlarını `ToListAsync` ile belleğe çekip sonrasında grupluyor. Kişisel portföy ölçeğinde kabul edilebilir olsa da arama isteği sık çalıştığı için veri büyüdükçe gecikme ve bellek maliyeti artabilir.
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
Kısa vadede sonuçlar cache'lenmeli veya yalnızca gerekli transaction alanları select edilmeli. Orta vadede pozisyon özeti için incremental/materialized bir okuma modeli ya da SQL tarafında özetleme stratejisi değerlendirilmeli.
```

## #4 - API health check veritabanı sağlığını doğrulamıyor
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** DevOps, Bug
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Program.cs` · `/health` endpoint'i · L91 · `docker-compose.yml` · `api.healthcheck`
- **Açıklama:** `/health` endpoint'i her zaman statik healthy cevabı veriyor. Docker compose frontend'i API healthcheck sonucuna bağladığı için API container'ı veritabanına bağlanamasa veya migration başarısız olsa bile orchestration katmanı servisi sağlıklı kabul edebilir.
- **Mevcut Durum:**
```csharp
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
```
- **Önerilen Eylem:**
```text
ASP.NET Core HealthChecks kullanılmalı. En azından ApplicationDbContext üzerinden CanConnectAsync veya AddNpgSql tabanlı DB health check eklenmeli; compose healthcheck bu gerçek durumu okumalı.
```

## #5 - AssetId verildiğinde transaction request hâlâ Symbol zorunlu tutuyor
- **Önem Derecesi:** Düşük
- **Durum:** Açık
- **Etiketler:** Backend, Bakım
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Transactions/TransactionRequests.cs` · `CreateTransactionRequest` · L9 · `UpdateTransactionRequest` · L23
- **Açıklama:** Transaction create/update isteklerinde `AssetId` opsiyonel olarak destekleniyor, fakat `Symbol` alanı `[Required]` olduğu için asset seçimi yapıldığında bile client'ın sembol göndermesi gerekiyor. Bu, asset ilişkili yeni API yüzeyiyle tam uyumlu değil ve gelecekte assetId-only istemciler için gereksiz validasyon hatasına dönüşebilir.
- **Mevcut Durum:**
```csharp
public record CreateTransactionRequest(
    int? AssetId,
    [Required, MaxLength(120)] string Symbol,
    // ...
);

public record UpdateTransactionRequest(
    int Id,
    int? AssetId,
    [Required, MaxLength(120)] string Symbol,
    // ...
);
```
- **Önerilen Eylem:**
```text
Symbol nullable yapılmalı ve koşullu validasyon uygulanmalı: AssetId varsa Symbol opsiyonel, AssetId yoksa Symbol zorunlu olmalı. Controller/service tarafında net ve tek tip 400 cevabı dönülmeli.
```

## #6 - PortfolioCalculations kritik edge case'ler için izole testlere sahip değil
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** Test, Bakım
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Portfolio/PortfolioCalculations.cs` · `tests/PortfolioTracker.API.IntegrationTests`
- **Açıklama:** Portföyün WAC, realized/unrealized PnL, kapalı pozisyon toleransı ve dashboard summary hesapları merkezi olarak `PortfolioCalculations` içinde duruyor. Bu hesaplar entegrasyon testleriyle dolaylı doğrulanıyor, ancak hesaplama helper'larını doğrudan hedefleyen birim testleri yok. Finansal edge case'lerde regresyon yakalamak zorlaşabilir.
- **Mevcut Durum:**
```text
Integration testlerde portfolio endpoint davranışı doğrulanıyor; PortfolioCalculations.CalculatePosition, CalculateDashboardPosition ve CalculateDashboardSummary için doğrudan unit test dosyası bulunmuyor.
```
- **Önerilen Eylem:**
```text
PortfolioCalculations için ayrı unit test sınıfı eklenmeli. En azından art arda kısmi satış, tam kapanış, tolerans sınırı, fiyat yokken fallback, manual quote ve summary toplamları izole senaryolarla kapsanmalı.
```

## #7 - TransactionsController endpoint'lerinde CancellationToken kullanılmıyor
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** Backend, Performans
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Transactions/TransactionsController.cs` · `ITransactionService`
- **Açıklama:** Controller üzerindeki endpoint'lerde `CancellationToken` alınmıyor ve alt servislere geçilmiyor. Bu durum, istemci bağlantıyı kestiğinde uzun süren veritabanı sorgularının iptal edilememesine, gereksiz kaynak tüketimine ve dolaylı N+1 thread/blockaj durumlarına yol açabilir.
- **Mevcut Durum:**
```csharp
public async Task<IActionResult> GetAll([FromQuery] TransactionQuery query)
```
- **Önerilen Eylem:**
```text
Tüm asenkron endpoint'lere `CancellationToken cancellationToken` parametresi eklenmeli. `ITransactionService` ve `TransactionService` içindeki metot imzaları güncellenerek token `ToListAsync()`, `FirstOrDefaultAsync()` ve `SaveChangesAsync()` gibi DB metotlarına iletilmeli.
```

## #8 - PortfolioSettings oluşturulurken Race Condition (yarış durumu) oluşabilir
- **Önem Derecesi:** Düşük
- **Durum:** Açık
- **Etiketler:** Backend, Bug
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.API/Features/Portfolio/PortfolioService.cs` · `GetSettingsAsync` · L95
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
