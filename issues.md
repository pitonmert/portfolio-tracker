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

## #1 - Frontend test altyapısı bulunmuyor
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** Frontend, Test
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.Frontend` · `Test Altyapısı`
- **Açıklama:** Backend tarafında xUnit ve Testcontainers ile integration testler mevcutken frontend projesinde birim veya component testi bulunmuyor. Bu durum form davranışları, filtreleme ve kritik UI akışlarında regresyon riskini artırır.
- **Mevcut Durum:**
```text
Frontend projesinde Vitest, React Testing Library veya eşdeğer bir test kurulumu yok.
```
- **Önerilen Eylem:**
```text
Vitest ve React Testing Library kurulmalı. Öncelik useFilteredPositions, işlem formu validasyonları ve temel modal akışlarına verilmeli.
```

## #2 - Veri çekme ve state yönetimi manuel refresh akışına bağlı
- **Önem Derecesi:** Orta
- **Durum:** Açık
- **Etiketler:** Frontend, Mimari
- **Bağımlılıklar:** Yok
- **Konum:** `PortfolioTracker.Frontend/src/hooks/useAsync.ts` · `Veri Çekme`
- **Açıklama:** Mevcut `useAsync` küçük ihtiyaçlar için yeterli olsa da cache, optimistic update ve istek iptali gibi davranışları sağlamıyor. Sayfa yenilemeleri manuel `refreshKey` akışına bağlı olduğu için veri yönetimi büyüdükçe kırılganlaşabilir.
- **Mevcut Durum:**
```text
Veri yenileme akışları component state'i ve refreshKey değerleriyle manuel yönetiliyor.
```
- **Önerilen Eylem:**
```text
İhtiyaç büyüdüğünde TanStack Query gibi bir veri yönetimi kütüphanesine geçilmeli. İlk geçiş portfolio positions ve transaction list endpointleriyle sınırlandırılmalı.
```
