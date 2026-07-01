<!--
ROADMAP.MD - YAPAY ZEKA KULLANIM TALİMATLARI
=============================================
Bu dosya, projeye eklenebilecek yeni özellik fikirlerini ve ürün fırsatlarını
takip etmek için kullanılır. Hata, güvenlik açığı veya kod kalitesi sorunu
bulunduğunda bu dosyaya değil `issues.md` dosyasına kayıt aç.

## Amaç
Yapay zeka projeyi okuduğunda, mevcut ürün yönünü bozmayacak şekilde yeni özellik
fikirleri, iyileştirme fırsatları, entegrasyon önerileri ve kullanıcı değerini
artırabilecek geliştirmeler önerebilsin.

Bu dosya kesin teslim tarihi listesi değildir. Buradaki kayıtlar, değerlendirilmesi
gereken aday fikirlerdir.

## Kapsam
Bu dosyaya şunlar eklenebilir:
- Yeni kullanıcı özellikleri.
- Mevcut akışları daha verimli hale getiren ürün iyileştirmeleri.
- Entegrasyon, otomasyon veya raporlama fikirleri.
- Kullanıcı deneyimini, erişilebilirliği veya gözlemlenebilirliği artıran geliştirmeler.
- Projenin mevcut mimarisiyle uyumlu, uygulanabilir büyüme fikirleri.

Bu dosyaya şunları ekleme:
- Bug, güvenlik açığı veya çalışma zamanı riski. Bunlar `issues.md` dosyasına gider.
- Kanıtı olmayan, proje bağlamından kopuk veya tamamen spekülatif fikirler.
- Sadece iç refactor olan ve kullanıcıya ya da bakım akışına net değer üretmeyen işler.
- Kesin tarih, sürüm sözü veya bağlayıcı taahhüt.

## Dosya Yaşam Döngüsü Kuralları
- Mevcut fikirleri ASLA silme, yeniden numaralandırma veya üzerine yazma.
- Açıkça talimat verilmedikçe mevcut fikirlerin durumunu değiştirme.
- Yeni fikirleri yalnızca `# Roadmap Fikirleri` bölümünün en altına ekle.
- Yeni fikir numarası, dosyada kullanılan en büyük `R-N` değerinden bir artırılır.
- Fikirler eklenme sırasına göre tutulur; önceliğe göre yeniden sıralanmaz.
- Bir fikir `Tamamlandı` veya `Reddedildi` yapıldığında kısa bir karar notu ekle.

## Fikir Ne Zaman Eklenir
Şu durumlarda yeni roadmap fikri ekle:
- Kodda veya dokümantasyonda kullanıcı ihtiyacına işaret eden açık bir boşluk görürsen.
- Mevcut özelliği tamamlayan uygulanabilir bir ürün fırsatı fark edersen.
- Kullanıcı tekrar eden manuel işi azaltabilecek bir otomasyon veya entegrasyon isteyebilir.
- Projenin mevcut yönüne uygun, ölçülebilir değer üretebilecek bir geliştirme varsa.

Şu durumlarda fikir ekleme:
- Sadece teknoloji kullanmak için teknoloji ekleme.
- Mevcut proje yapısıyla uyumsuz büyük kapsam değişiklikleri.
- Önce hata olarak çözülmesi gereken konular.
- Başarı ölçütü veya kullanıcı değeri net olmayan öneriler.

## Fikir Şablonu
Yeni fikir eklerken aşağıdaki biçimi kullan:

## R-N - [Kısa, açıklayıcı başlık]
- **Durum:** Aday
- **Kategori:** Özellik | UX | Entegrasyon | Otomasyon | Analitik | DevEx | Dokümantasyon | Performans | Güvenlik
- **Etki:** Yüksek | Orta | Düşük
- **Efor:** Yüksek | Orta | Düşük
- **Öncelik:** P0 | P1 | P2 | P3
- **Hedef Kullanıcı:** [Bu fikir kimin için değerli?]
- **Problem/Fırsat:** [Hangi ihtiyacı veya fırsatı karşılıyor?]
- **Önerilen Özellik:** [Kullanıcıya görünür davranışı ve kapsamı açıkla.]
- **Başarı Ölçütü:** [Fikrin işe yaradığını nasıl anlarız?]
- **Bağımlılıklar:** Yok | R-N | issues.md #N | dış sistem/karar
- **Notlar:** [Varsayımlar, riskler veya açık sorular.]

## Öncelik Kılavuzu
- `P0`: Stratejik olarak kritik veya birçok kullanıcıyı doğrudan etkileyen yüksek değerli fikir.
- `P1`: Net kullanıcı değeri olan, yakın vadede değerlendirilmeye uygun fikir.
- `P2`: Faydalı ama daha fazla doğrulama veya uygun zamanlama gerektiren fikir.
- `P3`: Düşük etkili, deneysel veya ileride tekrar bakılabilecek fikir.

## Durum Değerleri
`Aday` · `Araştırılacak` · `Planlandı` · `Devam Ediyor` · `Tamamlandı` · `Reddedildi`

## Değerlendirme İlkeleri
- Etki ve eforu birlikte düşün. Yüksek etki/düşük efor fikirleri öne çıkar.
- Kullanıcı değeri, uygulanabilirlik ve mevcut mimariyle uyum yoksa fikri ekleme.
- Bir fikir bir bug düzeltmesine bağlıysa önce ilgili `issues.md` kaydını referans göster.
- Gerekiyorsa fikri küçük, teslim edilebilir parçalara böl.
-->

# Roadmap Fikirleri

## R-1 - CSV dışa ve içe aktarma
- **Durum:** Aday
- **Kategori:** Otomasyon
- **Etki:** Orta
- **Efor:** Yüksek
- **Öncelik:** P2
- **Hedef Kullanıcı:** Verisini yedeklemek, başka araçlarda analiz etmek veya toplu işlem aktarmak isteyen kullanıcı.
- **Problem/Fırsat:** İşlem sayısı arttıkça manuel yedekleme, farklı cihazlara taşıma ve geçmiş veriyi toplu düzeltme zorlaşıyor.
- **Önerilen Özellik:** Önce `/api/transactions` verisiyle CSV dışa aktarma eklenmeli. İkinci aşamada CSV içe aktarma, dry-run doğrulama, satır bazlı hata listesi ve kaydetmeden önce önizleme ekranı eklenmeli.
- **Başarı Ölçütü:** Kullanıcı işlemlerini CSV olarak indirebilmeli; geçerli bir CSV dosyasını içe aktarmadan önce hata satırlarını görebilmeli.
- **Bağımlılıklar:** Backend transaction validasyonları, asset çözümleme davranışı ve frontend dosya yükleme akışı
- **Notlar:** Önerilen kolonlar: AssetId, Sembol, Tarih, Tür, Adet, Birim Fiyat, Not. `AssetId` varsa doğrudan kullanılmalı; yoksa sembol mevcut asset resolver davranışıyla çözülmeli. `TotalAmount` backend tarafından hesaplandığı için içe aktarımda kaynak değer olarak alınmamalı.

## R-2 - Geçmiş performans grafikleri
- **Durum:** Aday
- **Kategori:** Analitik
- **Etki:** Orta
- **Efor:** Orta
- **Öncelik:** P2
- **Hedef Kullanıcı:** Portföyünün zaman içindeki değişimini görmek isteyen kullanıcı.
- **Problem/Fırsat:** Portföy sayfası güncel toplam değer, bakiye ve pozisyon kartlarını gösteriyor; geçmiş portföy değeri saklanmadığı için trend analizi yapılamıyor.
- **Önerilen Özellik:** Günlük portföy snapshot tablosu eklenmeli ve toplam portföy değeri son 30 gün, 6 ay, 1 yıl gibi aralıklarda çizgi grafikle gösterilmeli.
- **Başarı Ölçütü:** Kullanıcı portföy değerinin seçili zaman aralığında nasıl değiştiğini tek bakışta anlayabilmeli.
- **Bağımlılıklar:** Günlük portföy değer snapshot modeli, `PortfolioPositions` read model ve güvenilir fiyat güncelleme akışı
- **Notlar:** Mevcut `PortfolioPositions` tablosu güncel pozisyon read model'idir; tarihsel trend için ayrı günlük toplam değer snapshot'ı gerekir. `market-data-service` anlık fiyat döndürüyor, geçmiş performans için uygulama kendi günlük değerini saklamalıdır.

## R-3 - Temettü takibi
- **Durum:** Aday
- **Kategori:** Özellik
- **Etki:** Yüksek
- **Efor:** Orta
- **Öncelik:** P1
- **Hedef Kullanıcı:** Hisse temettü gelirlerini portföy performansına dahil etmek isteyen kullanıcı.
- **Problem/Fırsat:** Backend işlem modeli şu an `Buy/Sell` üzerinden çalışıyor; temettü gelirleri gerçekleşmiş performansa dahil edilemiyor.
- **Önerilen Özellik:** İşlem türlerine `Dividend` eklenmeli; DTO, entity, testler, frontend formu, `PortfolioCalculations` ve `PortfolioPositions` read model yeniden hesaplama akışı temettü gelirini ayrı gerçekleşmiş gelir olarak desteklemeli.
- **Başarı Ölçütü:** Kullanıcı varlık bazında ve toplam portföyde temettü gelirini ayrı görebilmeli.
- **Bağımlılıklar:** Backend işlem türü sözleşmesi, portföy hesaplama kuralları ve snapshot recalculation akışı
- **Notlar:** İlk sürümde temettü ortalama maliyeti düşürmek yerine ayrı gelir olarak gösterilmeli; WAC hesaplaması daha az riskle korunur.

## R-4 - Portföy dağılımı
- **Durum:** Aday
- **Kategori:** Analitik
- **Etki:** Orta
- **Efor:** Orta
- **Öncelik:** P2
- **Hedef Kullanıcı:** Portföy riskini ve ağırlıklarını görmek isteyen kullanıcı.
- **Problem/Fırsat:** Pozisyon kartları tek tek piyasa değerini gösteriyor ancak toplam portföy içinde hangi varlığın ne kadar ağırlık taşıdığı görünmüyor.
- **Önerilen Özellik:** `/api/portfolio/dashboard` response'undaki açık pozisyonların `marketValue` alanları üzerinden toplam piyasa değeri içindeki yüzdesi gösterilmeli; fiyatı olmayan pozisyonlar ayrı "fiyat bekliyor" grubunda belirtilmeli.
- **Başarı Ölçütü:** Kullanıcı en yüksek ağırlıklı varlıkları ve dağılım dengesini kolayca okuyabilmeli.
- **Bağımlılıklar:** `PortfolioPositions` read model, dashboard summary ve güncel market price akışı
- **Notlar:** İlk sürümde grafik yerine kompakt liste veya progress bar daha sade olur; eksik fiyatlar toplam değeri yanıltmamalı. Finansal hesap frontend'e taşınmamalı, frontend yalnızca backend'den gelen değerleri oranlayıp göstermeli.

## R-5 - Komisyon ve vergi giderleri
- **Durum:** Aday
- **Kategori:** Özellik
- **Etki:** Yüksek
- **Efor:** Orta
- **Öncelik:** P1
- **Hedef Kullanıcı:** Kâr/zarar hesabını net maliyetlerle takip etmek isteyen kullanıcı.
- **Problem/Fırsat:** `TotalAmount` backend'de adet ve birim fiyat üzerinden hesaplanıyor; komisyon ve vergi giderleri WAC ve K/Z değerlerine dahil edilmiyor.
- **Önerilen Özellik:** Transaction modeline komisyon ve opsiyonel gider alanları eklenmeli; backend WAC hesaplaması, `PortfolioPositions` snapshot değerleri, frontend form önizlemesi ve integration testler net maliyeti kullanmalı.
- **Başarı Ölçütü:** Kullanıcı net maliyet ve net gerçekleşmiş K/Z değerlerini görebilmeli.
- **Bağımlılıklar:** EF migration, DTO güncellemesi, `PortfolioCalculations.cs`, snapshot recalculation akışı ve `transactionForm` önizleme helper'ları
- **Notlar:** İlk sürümde tek `Commission` alanı yeterli olabilir; toplam değer yine backend tarafından authoritative hesaplanmalı.

## R-6 - Terminal istemcisi
- **Durum:** Aday
- **Kategori:** DevEx
- **Etki:** Düşük
- **Efor:** Orta
- **Öncelik:** P3
- **Hedef Kullanıcı:** Portföy durumunu terminalden hızlıca görmek isteyen teknik kullanıcı.
- **Problem/Fırsat:** Docker veya lokal API çalışırken portföy özetine ulaşmak için web arayüzünü açmak gerekiyor.
- **Önerilen Özellik:** `portfolio status`, `portfolio positions`, `portfolio cash` gibi komutlarla mevcut API endpoint'lerinden özet bilgi çeken basit bir CLI istemcisi.
- **Başarı Ölçütü:** Kullanıcı terminalden toplam değer, bakiye ve K/Z özetini alabilmeli.
- **Bağımlılıklar:** `GET /api/portfolio/dashboard` ve lokal/API erişim yapılandırması
- **Notlar:** Web arayüzünün iş mantığı tekrar edilmemeli; CLI yalnızca API client olmalı.

## R-7 - Otomatik bildirimler
- **Durum:** Aday
- **Kategori:** Otomasyon
- **Etki:** Orta
- **Efor:** Orta
- **Öncelik:** P2
- **Hedef Kullanıcı:** Portföy değişimlerinden haberdar olmak isteyen kullanıcı.
- **Problem/Fırsat:** Fiyatlar arka planda güncellenebiliyor ancak hedef fiyat, günlük özet veya yüksek değişim gibi olaylar kullanıcıya otomatik iletilmiyor.
- **Önerilen Özellik:** Telegram, Discord veya benzeri kanal üzerinden günlük portföy özeti ve isteğe bağlı hedef fiyat bildirimleri gönderilmeli.
- **Başarı Ölçütü:** Kullanıcı belirlediği koşullarda otomatik bildirim alabilmeli.
- **Bağımlılıklar:** Hedef fiyat kural modeli, fiyat worker yapılandırması, notification channel secrets ve güvenilir `PortfolioPositions` güncelleme akışı
- **Notlar:** Önce günlük özet bildirimi eklenmeli; fiyat tetikleyicileri event/worker akışı netleştikten sonra daha güvenli olur.

## R-8 - Endeks kıyaslaması
- **Durum:** Aday
- **Kategori:** Analitik
- **Etki:** Orta
- **Efor:** Yüksek
- **Öncelik:** P2
- **Hedef Kullanıcı:** Portföy performansını referans endekslerle karşılaştırmak isteyen kullanıcı.
- **Problem/Fırsat:** Portföyün mutlak getirisi görülüyor ancak aynı dönemde BIST 100, fon endeksi veya benzeri benchmark karşısındaki performans bilinmiyor.
- **Önerilen Özellik:** Kullanıcı benchmark seçebilmeli; portföy snapshot'ları benchmark geçmiş verisiyle aynı zaman aralığında karşılaştırılmalı.
- **Başarı Ölçütü:** Kullanıcı portföyünün benchmark'a göre daha iyi veya kötü performans gösterdiğini görebilmeli.
- **Bağımlılıklar:** R-2 snapshot altyapısı ve `market-data-service` benchmark/geçmiş veri desteği
- **Notlar:** Mevcut quote endpoint'i anlık fiyat odaklı; benchmark için ayrı normalize edilmiş tarihsel seri kontratı gerekir.

## R-9 - Hedef ve planlama
- **Durum:** Aday
- **Kategori:** Özellik
- **Etki:** Orta
- **Efor:** Orta
- **Öncelik:** P2
- **Hedef Kullanıcı:** Birikim hedeflerini portföy büyümesiyle takip etmek isteyen kullanıcı.
- **Problem/Fırsat:** Bakiye ve toplam portföy değeri DB'de takip ediliyor ancak kullanıcı hedef tutar veya hedefe ilerleme bilgisi tanımlayamıyor.
- **Önerilen Özellik:** Kullanıcı hedef adı, hedef tutar ve opsiyonel hedef tarihi tanımlayabilmeli; mevcut toplam değer üzerinden ilerleme yüzdesi gösterilmeli.
- **Başarı Ölçütü:** Kullanıcı hedefe kalan tutarı ve ilerleme yüzdesini görebilmeli.
- **Bağımlılıklar:** Yeni hedef entity'si veya `PortfolioSettings` genişletmesi
- **Notlar:** `PortfolioSettings` tek kayıt varsayımıyla çalışıyor; hedefler birden fazla olacaksa ayrı tablo daha doğru olur.

## R-10 - Fiziksel masaüstü göstergesi
- **Durum:** Aday
- **Kategori:** Entegrasyon
- **Etki:** Düşük
- **Efor:** Yüksek
- **Öncelik:** P3
- **Hedef Kullanıcı:** Portföy durumunu fiziksel bir cihazda görmek isteyen kullanıcı.
- **Problem/Fırsat:** Portföy özeti web ve API üzerinden erişilebilir ancak fiziksel, sürekli görünür bir gösterge yok.
- **Önerilen Özellik:** ESP32 ve küçük OLED/RGB ekran ile toplam değer, günlük özet veya fiyat uyarısı gösteren lokal cihaz entegrasyonu.
- **Başarı Ölçütü:** Cihaz API'den veri çekip güncel özet bilgiyi gösterebilmeli.
- **Bağımlılıklar:** Stabil API erişimi, düşük boyutlu özet endpoint'i ve cihaz yazılımı
- **Notlar:** Mevcut endpoint'ler cihaz için fazla detay dönebilir; küçük bir summary endpoint'i gerekebilir.

## R-11 - macOS menü çubuğu uygulaması
- **Durum:** Aday
- **Kategori:** Entegrasyon
- **Etki:** Düşük
- **Efor:** Orta
- **Öncelik:** P3
- **Hedef Kullanıcı:** Tarayıcı açmadan portföy özetini görmek isteyen macOS kullanıcısı.
- **Problem/Fırsat:** Kısa durum kontrolü için `PortfolioTracker.Frontend` arayüzünü açmak gereksiz olabilir.
- **Önerilen Özellik:** Menü çubuğunda toplam değer, bakiye ve K/Z özetini gösteren minimal bir uygulama.
- **Başarı Ölçütü:** Kullanıcı menü çubuğundan portföy özetini hızlıca görebilmeli.
- **Bağımlılıklar:** Lokal veya Cloudflare üzerinden erişilebilir API
- **Notlar:** Raycast ve CLI fikirleriyle kapsam çakışıyor; tek bir ortak API client katmanı kullanılmalı.

## R-12 - Akıllı yeniden dengeleme
- **Durum:** Aday
- **Kategori:** Analitik
- **Etki:** Orta
- **Efor:** Yüksek
- **Öncelik:** P2
- **Hedef Kullanıcı:** Hedef portföy dağılımına göre alım planlamak isteyen kullanıcı.
- **Problem/Fırsat:** Kullanıcı DB'de saklanan nakit bakiyeyi ve mevcut pozisyon değerlerini görüyor ancak hedef dağılıma yaklaşmak için ne alması gerektiğini manuel hesaplıyor.
- **Önerilen Özellik:** Hedef ağırlıklar tanımlanmalı; mevcut piyasa değeri, bakiye ve eksik fiyatlar dikkate alınarak önerilen alımlar hesaplanmalı.
- **Başarı Ölçütü:** Kullanıcı hedef dağılıma yaklaşmak için hangi varlıktan kaç adet alacağını görebilmeli.
- **Bağımlılıklar:** R-4 portföy dağılımı, nakit bakiye ve güvenilir fiyat verisi
- **Notlar:** Emir verme veya otomatik alım kapsam dışında kalmalı.

## R-13 - Lot bazlı takip ve optimizasyon
- **Durum:** Aday
- **Kategori:** Analitik
- **Etki:** Orta
- **Efor:** Yüksek
- **Öncelik:** P3
- **Hedef Kullanıcı:** Alım lotlarını ayrı izlemek ve satış etkisini detaylı analiz etmek isteyen kullanıcı.
- **Problem/Fırsat:** `PortfolioCalculations.cs` WAC yaklaşımıyla çalışıyor; bu sade ve mevcut ürün için doğru ancak lot bazlı satış senaryolarını göstermez.
- **Önerilen Özellik:** WAC varsayılan model olarak korunmalı; opsiyonel analiz modunda her alım ayrı lot olarak gösterilip FIFO/LIFO veya özel lot seçimi simüle edilebilmeli.
- **Başarı Ölçütü:** Kullanıcı satış senaryolarının maliyet ve K/Z etkisini lot bazında görebilmeli.
- **Bağımlılıklar:** Yeni hesaplama modeli, ek test matrisi ve mevcut WAC davranışını koruyan regresyon testleri
- **Notlar:** Varsayılan portföy kartları WAC kullanmaya devam etmeli; lot analizi ayrı detay görünümü olmalı.

## R-14 - VS Code durum çubuğu entegrasyonu
- **Durum:** Aday
- **Kategori:** DevEx
- **Etki:** Düşük
- **Efor:** Orta
- **Öncelik:** P3
- **Hedef Kullanıcı:** Kod yazarken portföy özetini editörde görmek isteyen kullanıcı.
- **Problem/Fırsat:** Geliştirme sırasında portföy durumunu kontrol etmek için tarayıcı veya terminale geçmek gerekiyor.
- **Önerilen Özellik:** VS Code status bar üzerinde toplam değer, bakiye veya K/Z özetini gösteren küçük bir eklenti.
- **Başarı Ölçütü:** Kullanıcı editörden çıkmadan portföy özetini görebilmeli.
- **Bağımlılıklar:** Lokal API erişimi veya Cloudflare üzerinden erişilebilir API
- **Notlar:** R-6 ve R-15 ile ortak API client mantığı paylaşılmalı; ayrı iş mantığı yazılmamalı.

## R-15 - Raycast entegrasyonu
- **Durum:** Aday
- **Kategori:** Entegrasyon
- **Etki:** Düşük
- **Efor:** Düşük
- **Öncelik:** P3
- **Hedef Kullanıcı:** macOS üzerinde klavye kısayoluyla hızlı portföy sorgusu yapmak isteyen kullanıcı.
- **Problem/Fırsat:** Basit bakiye, toplam değer veya pozisyon araması için uygulamayı açmak zaman alıyor.
- **Önerilen Özellik:** Raycast komutu ile mevcut API'den toplam değer, bakiye, K/Z ve opsiyonel sembol detayı getiren lokal uzantı.
- **Başarı Ölçütü:** Kullanıcı Raycast üzerinden tek komutla portföy özetini görebilmeli.
- **Bağımlılıklar:** Lokal API erişimi ve küçük bir API client helper'ı
- **Notlar:** Menü çubuğu uygulamasına göre daha düşük eforlu bir ilk entegrasyon olabilir.

## R-16 - Çoklu varlık desteği
- **Durum:** Aday
- **Kategori:** Özellik
- **Etki:** Orta
- **Efor:** Orta
- **Öncelik:** P2
- **Hedef Kullanıcı:** Hisse dışında döviz, altın veya fon gibi farklı varlıkları aynı portföyde izlemek isteyen kullanıcı.
- **Problem/Fırsat:** Asset katalog modeli `AssetType` ve transaction tarafında `AssetId` ilişkisini destekliyor; ancak fiyat sağlayıcı, frontend seçimleri, adet/değer formatları ve para birimi davranışları ağırlıklı olarak hisse/fon/custom senaryolarına göre şekillenmiş durumda.
- **Önerilen Özellik:** Döviz, altın, emtia ve manuel takip edilen farklı varlık türleri için katalog/fiyat kaynağı, formatlama, currency ve asset autocomplete davranışı genişletilmeli. Transaction akışı mümkün olduğunca `AssetId` üzerinden kalmalı; symbol-only fallback yalnızca geriye dönük uyumluluk için kullanılmalı.
- **Başarı Ölçütü:** Kullanıcı farklı varlık türlerini aynı portföyde doğru fiyat, adet ve değer formatıyla izleyebilmeli.
- **Bağımlılıklar:** Asset katalog genişletmesi, `market-data-service` assetType/quote kontratı, frontend asset type filtreleri ve formatlama kuralları
- **Notlar:** İlk sürümde otomatik tespit yerine kullanıcı seçimi daha güvenilir olabilir; mevcut `auto` davranış korunabilir ama tek kaynak olmamalı. Mevcut `Asset.AssetType` alanı genişletilmeli, transaction entity'sine ayrı asset type kopyası eklenmemeli.

## R-17 - Aracı kurum ekstre ayrıştırıcısı
- **Durum:** Aday
- **Kategori:** Otomasyon
- **Etki:** Yüksek
- **Efor:** Yüksek
- **Öncelik:** P2
- **Hedef Kullanıcı:** İşlemlerini manuel girmek istemeyen veya geçmiş verisini toplu aktarmak isteyen kullanıcı.
- **Problem/Fırsat:** Aracı kurum işlem dökümlerindeki verileri `TransactionFormModal` ile tek tek girmek zaman alıyor ve veri giriş hatası yaratıyor.
- **Önerilen Özellik:** Önce CSV/Excel ekstreleri, sonra gerekirse PDF ekstreleri yüklenerek alış/satış işlemleri ayrıştırılmalı; kullanıcı kaydetmeden önce doğrulama ekranında satırları onaylamalı.
- **Başarı Ölçütü:** Kullanıcı geçerli bir ekstre dosyasından işlem kayıtlarını manuel giriş yapmadan oluşturabilmeli.
- **Bağımlılıklar:** R-1 CSV içe aktarma doğrulama altyapısı
- **Notlar:** İlk sürümde tek aracı kurum ve CSV/Excel formatı daha gerçekçi; PDF ayrıştırma sonraki aşamaya bırakılmalı.

## R-18 - Fiziksel ibre göstergesi
- **Durum:** Aday
- **Kategori:** Entegrasyon
- **Etki:** Düşük
- **Efor:** Yüksek
- **Öncelik:** P3
- **Hedef Kullanıcı:** Portföy durumunu analog bir masaüstü göstergeyle takip etmek isteyen kullanıcı.
- **Problem/Fırsat:** Dijital portföy özeti fiziksel ortamda pasif olarak görünür değil.
- **Önerilen Özellik:** Günlük veya toplam K/Z oranına göre servo motorla hareket eden analog bir ibre göstergesi yapılmalı.
- **Başarı Ölçütü:** Cihaz API'den günlük durum bilgisini alıp ibreyi doğru yöne çevirebilmeli.
- **Bağımlılıklar:** Özet endpoint'i, R-2 varsa günlük değişim snapshot'ı ve mikrodenetleyici yazılımı
- **Notlar:** R-10 ile aynı donanım ailesinde değerlendirilebilir; toplam K/Z ile günlük K/Z kavramları karıştırılmamalı.

## R-19 - Özel Zsh eklentisi
- **Durum:** Aday
- **Kategori:** DevEx
- **Etki:** Düşük
- **Efor:** Düşük
- **Öncelik:** P3
- **Hedef Kullanıcı:** Terminali yoğun kullanan teknik kullanıcı.
- **Problem/Fırsat:** Portföy özetini hızlı görmek için tarayıcı veya ayrı CLI binary açmak gerekebilir.
- **Önerilen Özellik:** `portfolio status` gibi kısa komutlarla lokal API'den portföy özeti alan Zsh fonksiyon/eklenti seti.
- **Başarı Ölçütü:** Kullanıcı terminalden tek komutla güncel portföy özetini alabilmeli.
- **Bağımlılıklar:** Lokal API erişimi
- **Notlar:** R-6 terminal istemcisiyle çakışıyor; uygulanırsa R-6'nin daha dar ve düşük eforlu alternatifi olarak ele alınmalı.

## R-20 - Akıllı ortam aydınlatması
- **Durum:** Aday
- **Kategori:** Entegrasyon
- **Etki:** Düşük
- **Efor:** Orta
- **Öncelik:** P3
- **Hedef Kullanıcı:** Portföy durumunu ortam ışığı gibi pasif göstergelerle izlemek isteyen kullanıcı.
- **Problem/Fırsat:** Kâr/zarar durumu yalnızca arayüz veya API kontrol edildiğinde görülüyor.
- **Önerilen Özellik:** Toplam K/Z veya ileride günlük K/Z belirli eşikleri geçtiğinde akıllı ışık veya RGB LED renginin değişmesi.
- **Başarı Ölçütü:** Portföy belirlenen eşikleri geçtiğinde ortam aydınlatması doğru renge geçebilmeli.
- **Bağımlılıklar:** Özet endpoint'i, eşik ayarları ve desteklenen ışık/cihaz entegrasyonu
- **Notlar:** Günlük K/Z için R-2 snapshot altyapısı gerekir; ilk sürümde toplam K/Z veya manuel eşik daha uygulanabilir.
