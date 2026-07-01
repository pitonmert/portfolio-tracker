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

## R-1 - Daha hızlı işlem girişi
- **Durum:** Aday
- **Kategori:** UX
- **Etki:** Orta
- **Efor:** Düşük
- **Öncelik:** P2
- **Hedef Kullanıcı:** Sık işlem giren kullanıcı.
- **Problem/Fırsat:** İşlem oluşturma akışı çalışıyor ancak tekrar eden girişlerde kullanıcı aynı varlıkları ve bilgileri yeniden seçmek zorunda kalıyor.
- **Önerilen Özellik:** Son kullanılan varlıklar gösterilmeli, autocomplete açık pozisyonlara öncelik vermeli ve seçilen varlığın açık/kapalı durumu form içinde gösterilmeli.
- **Başarı Ölçütü:** Kullanıcı sık kullandığı varlıklarla yeni işlem eklerken daha az yazı yazarak formu tamamlayabilmeli.
- **Bağımlılıklar:** Yok
- **Notlar:** Mevcut autocomplete davranışı korunarak küçük adımlarla geliştirilebilir.

## R-2 - CSV dışa ve içe aktarma
- **Durum:** Aday
- **Kategori:** Otomasyon
- **Etki:** Orta
- **Efor:** Yüksek
- **Öncelik:** P2
- **Hedef Kullanıcı:** Verisini yedeklemek, başka araçlarda analiz etmek veya toplu işlem aktarmak isteyen kullanıcı.
- **Problem/Fırsat:** İşlem sayısı arttıkça manuel veri taşıma ve yedekleme zorlaşıyor.
- **Önerilen Özellik:** Önce tüm işlemleri CSV olarak dışa aktarma eklenmeli. Sonraki aşamada CSV içe aktarma, satır bazlı doğrulama ve hata raporu ile desteklenmeli.
- **Başarı Ölçütü:** Kullanıcı işlemlerini CSV olarak dışarı alabilmeli; ilerleyen aşamada geçerli bir CSV dosyasından toplu işlem oluşturabilmeli.
- **Bağımlılıklar:** Yok
- **Notlar:** Dışa aktarma içe aktarmadan önce yapılmalı. Önerilen kolonlar: Tarih, Varlık, Tür, Adet, Birim Fiyat, Toplam, Not.

## R-3
* **Geçmiş Performans Grafikleri:** `YahooQuotesPriceProvider` içerisine `GetHistoryAsync` metodunu zaten hazırlamıştın ama arayüzde henüz kullanmıyorsun. Portföyün son 30 günlük veya 1 yıllık gelişimini gösteren bir çizgi grafik (Recharts vb. ile) eklenebilir.
* **Temettü (Dividend) Takibi:** Gerçek portföy yönetiminin vazgeçilmezidir. İşlem (Transaction) türlerine "Alış", "Satış" yanına "Temettü" de eklenerek, hisseden elde edilen pasif gelirlerin ortalama maliyeti nasıl düşürdüğü hesaplanabilir.
* **Portföy Dağılımı (Asset Allocation):** Mevcut varlıkların toplam portföy içindeki ağırlığını (yüzdesini) gösteren bir pasta grafik eklenebilir. İleride hisselere "Sektör" etiketi eklenerek sektörel dağılım da yapılabilir.
* **Komisyon ve Vergi Giderleri:** İşlem kaydederken ödenen aracı kurum komisyonu da (tutar veya binde X oranıyla) kaydedilerek K/Z hesaplamaları daha hassas hale getirilebilir.
* **Çoklu Varlık Desteği:** Sadece BIST hisseleri değil; USD/TRY, EUR/TRY veya Altın (XAU) gibi enstrümanları da takip edebilecek yapı (Yahoo API bunu halihazırda destekliyor).
* **Aracı Kurum Ekstre Ayrıştırıcısı (Statement Parser):** Midas veya diğer aracı kurumlardan aldığın aylık PDF/Excel işlem dökümlerini sisteme yüklediğinde, içindeki alış/satış verilerini okuyup otomatik olarak `Transactions` tablosuna işleyen bir yapı. Manuel veri girişini tamamen ortadan kaldırır.
* **Terminal (CLI) İstemcisi:** Geliştirme ortamından veya kod editöründen hiç çıkmadan, terminale yazacağın basit bir komutla (örneğin `portfolio --summary` veya `portfolio --bist`) anlık K/Z durumunu ve güncel fiyatları getiren bir CLI aracı. Backend API'ın zaten hazır olduğu için bunu yazmak çok pratiktir.
* **Otomatik Bildirimler (Webhooks/Bots):** Arka planda çalışan Worker'ı kullanarak bir Telegram veya Discord botu entegrasyonu kurmak. Her akşam piyasa kapandığında portföyün günlük özetini veya belirli bir hisse belirlediğin hedef fiyata düştüğünde/çıktığında anlık alarm göndermesi.
* **Endeks Kıyaslaması (Benchmarking):** Portföyünün genel getirisini Borsa İstanbul BIST 100 (`XU100.IS`) veya enflasyon verisi ile yan yana grafiğe dökmek. "Sadece hisse tutarak endeksi yenebildim mi yoksa gerisinde mi kaldım?" sorusuna net cevap verir.
* **Hedef ve Planlama (Goal Tracking):** Sadece mevcut durumu göstermek yerine, "Erken Emeklilik (FIRE)" veya "Araba Alma" gibi hedefler tanımlayıp, portföyün mevcut büyüme hızıyla bu hedeflere ne zaman ulaşılacağını tahmin eden basit bir projeksiyon hesaplayıcısı.
* **Fiziksel Masaüstü Göstergesi (IIoT):** .NET API'nin ucuna bir ESP32 mikrodenetleyici ve ufak bir OLED ekran (veya RGB LED) bağlayarak donanımsal bir borsa ekranı (ticker) yapmak. Portföy kârdaysa yeşil, zarardaysa kırmızı yanan ortam aydınlatmalı bir masaüstü aracı.
* **İşletim Sistemi Menü Çubuğu (Menu Bar) Uygulaması:** Tarayıcıyı açmaya gerek kalmadan, doğrudan macOS menü çubuğunda yaşayan minimal bir widget. Backend'deki polling uç noktana bağlanıp anlık durumu sessizce gösterebilir.
* **Akıllı Yeniden Dengeleme (Rebalancing) Motoru:** "Portföyümün %60'ı teknoloji, %40'ı bankacılık olsun" hedefini sisteme verdikten sonra, yeni nakit eklendiğinde hangi hisseden tam olarak kaç adet alman gerektiğini hesaplayan bir algoritma.
* **Lot Bazlı Takip ve Optimizasyon (FIFO/LIFO):** Sadece "ortalama maliyet" hesaplamak yerine, her alımı ayrı bir paket (lot) olarak tutup, satış yaparken kârlılığı veya vergi durumunu optimize edecek en uygun lotları öneren bir simülatör.
* **Fiziksel İbre (Servo Motor):** Masanda duran analog bir kadran düşün. API'den gelen günlük K/Z oranına göre bir servo motor, ibreyi otonom şekilde hareket ettirerek kâr veya zarar yönüne çevirsin.
* **Özel Zsh Eklentisi (CLI):** Tarayıcıyı hiç açmadan, terminalde kod yazarken `portfoy status` veya `mora portfoy` gibi komutlarla anlık piyasa değerini çeken bir komut satırı aracı.
* **VS Code Durum Çubuğu (Status Bar):** Kod yazarken editörden çıkmana gerek kalmasın. VS Code'un en altındaki durum çubuğunda portföyünün günlük değişimini anlık gösteren sana özel minik bir eklenti.
* **Akıllı Ortam Aydınlatması:** API'ni odandaki akıllı aydınlatmaya (veya ESP32 kontrolündeki RGB şerit ledlere) bağlayabilirsin. Portföy günlük %2'nin üzerinde değer kaybederse odanın ışıkları kırmızıya, %2 üstü kârda yeşile dönsün.
* **macOS Raycast Entegrasyonu:** Klavye kısayoluyla açtığın arama çubuğunda (Raycast veya Alfred), sadece "bakiye" yazarak API'ne anında istek atıp portföy özetini getiren lokal bir uzantı.
