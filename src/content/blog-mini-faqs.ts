// Blog yazıları için mini SSS bölümleri.
// Reklam yasağı (Av. K. m.55, TBB Meslek Kuralları) gözetilerek;
// objektif, mevzuata ve ilgili Yargıtay kararına dayalı, nötr dilde hazırlanmıştır.

export type MiniFaq = { question: string; answer: string };

export const blogMiniFaqs: Record<string, MiniFaq[]> = {
  'yargitay-ifade-ozgurlugu-hakaret-siyasi-elestiri': [
    {
      question: 'Sosyal medyadaki ağır siyasi eleştiri hakaret suçu oluşturur mu?',
      answer:
        'Yargıtay 4. Ceza Dairesi’nin güncel kararı uyarınca, kamusal figürlere yönelik ağır da olsa siyasi nitelikli eleştiriler ifade özgürlüğü kapsamında değerlendirilebilmekte ve TCK m.125’teki hakaret suçunun unsurlarını oluşturmamaktadır. Kişinin onur, şeref ve saygınlığını rencide eden, doğrudan kişiliğe yönelmiş sövme niteliğindeki ifadeler ise koruma kapsamı dışındadır.',
    },
    {
      question: 'Hakaret suçunun cezası nedir? (TCK 125)',
      answer:
        'Hakaret suçu için TCK m.125 uyarınca 3 aydan 2 yıla kadar hapis veya adli para cezası öngörülmüştür. Suçun kamu görevlisine karşı görevinden dolayı işlenmesi, alenen veya basın yoluyla işlenmesi gibi nitelikli hâllerde alt sınır 1 yıldan az olamaz.',
    },
    {
      question: 'Kamu figürlerinin eleştiriye katlanma yükümlülüğü var mıdır?',
      answer:
        'Avrupa İnsan Hakları Mahkemesi ve Yargıtay içtihatlarına göre siyasetçiler, sıradan bireylere kıyasla daha geniş eleştiriye katlanmakla yükümlüdür. Siyasi söylem ve kamuyu ilgilendiren konulardaki ifadeler, ifade özgürlüğünün özüne en yakın korunan ifadeler arasında sayılır.',
    },
    {
      question: 'Hakaret davasında şikâyet süresi kaç aydır?',
      answer:
        'Hakaret suçu kural olarak şikâyete bağlı suçlardandır. Mağdur, fiili ve faili öğrendiği tarihten itibaren 6 ay içinde şikâyet hakkını kullanmalıdır; aksi hâlde dava şartı gerçekleşmediğinden kovuşturma yapılamaz.',
    },
  ],

  'radarda-10-tolerans-donemi-bitti-yeni-trafik-cezasi-sistemi-nasil-isleyecek': [
    {
      question: '%10 hız tolerans uygulaması neden kaldırıldı?',
      answer:
        'Karayolları Trafik Kanunu’nda yapılan güncel değişiklikle, hız ihlali tespitinde kullanılan oransal %10 tolerans kuralı kaldırılmış; yerine sabit tolerans sistemi getirilmiştir. Düzenlemenin amacı, yüksek hız sınırlarında orantısız genişleyen tolerans aralığını daraltarak trafik güvenliğini artırmaktır.',
    },
    {
      question: 'Radar hız cezasına nasıl itiraz edilir?',
      answer:
        'Trafik idari para cezalarına karşı, tebliğden itibaren 15 gün içinde Sulh Ceza Hakimliğine başvuru yapılabilir. Başvuruda; ölçüm cihazının kalibrasyon belgesi, levha ve işaretleme uygunluğu, tutanağın usulüne uygun düzenlenip düzenlenmediği gibi şekil ve esas yönünden incelenebilecek hususlar ileri sürülebilir.',
    },
    {
      question: 'Erken ödeme indirimi devam ediyor mu?',
      answer:
        'Kabahatler Kanunu m.17/6 uyarınca idari para cezasının tebliğden itibaren 15 gün içinde ödenmesi hâlinde dörtte bir oranında indirim uygulanmaktadır. Ancak bu indirimden yararlanmak, cezaya karşı dava açma hakkını ortadan kaldırmaz.',
    },
    {
      question: 'Hız ihlalinde ehliyete el koyma hangi durumda yapılır?',
      answer:
        'KTK m.51 uyarınca aynı suçun bir yıl içinde üç defa işlenmesi hâlinde sürücü belgesine geçici olarak el konulur. Hız sınırının önemli ölçüde aşılması ve tekerrür hâllerinde belge geri alma süreleri farklılaşmaktadır.',
    },
  ],

  'tapu-iptali-ve-tescil-fiili-taksim-yargitay-karari-2025': [
    {
      question: 'Fiili taksim nedir?',
      answer:
        'Fiili taksim, paylı mülkiyete konu taşınmazın paydaşlar arasında resmî bir tapu işlemi olmaksızın, fiilen kullanım itibarıyla ayrı bölümlere ayrılması ve her paydaşın kendi bölümünde uzun süre yararlanmasıdır. Yargıtay, fiili taksimin varlığını ispatlanması hâlinde paylı mülkiyetteki bölümün tek başına devrini geçerli sayabilmektedir.',
    },
    {
      question: 'Tapu iptali ve tescil davası kim tarafından açılabilir?',
      answer:
        'Tapu iptali ve tescil davası, taşınmaz üzerinde gerçek hak sahibi olduğunu iddia eden kişi tarafından, tapuda malik görünen kişiye karşı açılır. Davada hak iddiasının dayanağı (muvazaa, hile, fiili taksim, kazandırıcı zamanaşımı vb.) ve buna ilişkin tüm deliller ileri sürülmelidir.',
    },
    {
      question: 'Fiili taksim nasıl ispatlanır?',
      answer:
        'Fiili taksim; tanık beyanları, keşif tutanakları, vergi kayıtları, eski hava fotoğrafları, abonelik belgeleri, paydaşların uzun süreli ve çekişmesiz kullanımı gibi her türlü delille ispatlanabilir. Yargıtay, fiili taksim iddiasında mahkemenin keşif yapması ve teknik bilirkişi raporu alınmasını zorunlu görmektedir.',
    },
    {
      question: 'Paylı mülkiyette pay devri için diğer paydaşların onayı gerekir mi?',
      answer:
        'TMK m.688 vd. uyarınca paydaş, kendi payını diğer paydaşların onayı olmaksızın devredebilir. Ancak diğer paydaşların yasal önalım hakkı vardır ve bu hak, satışın bildirildiği tarihten itibaren 3 ay, her hâlde 2 yıl içinde dava yoluyla kullanılabilir.',
    },
  ],

  'zilyetlik-imar-plani-yargitay-karari-2025': [
    {
      question: 'Kazandırıcı zamanaşımı için kaç yıl zilyetlik gerekir?',
      answer:
        'TMK m.713 uyarınca tapuda kayıtlı olmayan bir taşınmazda davasız ve aralıksız 20 yıl süreyle malik sıfatıyla zilyet olan kişi, mahkeme kararıyla taşınmazın adına tescilini isteyebilir. Davada zilyetliğin niteliği, süresi ve aralıksızlığı ispatlanmalıdır.',
    },
    {
      question: 'İmar planına alınma zilyetlik süresini durdurur mu?',
      answer:
        'Yargıtay 1. Hukuk Dairesi’nin 06.11.2025 tarihli kararı uyarınca, taşınmazın nazım imar planına dahil edildiği tarihten itibaren bu yer kamu hizmetine tahsis edilmiş sayılmakta ve kazandırıcı zamanaşımı süresi işlemez hâle gelmektedir. Plan öncesinde tamamlanmış 20 yıl varsa hak korunur, ancak plan tarihinden sonra geçen süre hesaba katılmaz.',
    },
    {
      question: 'Hangi taşınmazlar zilyetlikle kazanılamaz?',
      answer:
        '4721 sayılı TMK ve 3402 sayılı Kadastro Kanunu uyarınca devletin hüküm ve tasarrufu altındaki yerler, kamu malları, mera, yaylak, kışlak, orman vasıflı taşınmazlar ve kıyı kenar çizgisi içinde kalan yerler zilyetlikle kazanılamaz.',
    },
    {
      question: 'Zilyetlik davasında hangi deliller kullanılır?',
      answer:
        'Tanık beyanları, kadastro tutanakları, vergi kayıtları, eski hava fotoğrafları, keşif ve teknik bilirkişi raporu, mahalli bilirkişi beyanı zilyetliğin ispatında kullanılan başlıca delillerdir. Mahkemenin keşif yapma ve gerekli araştırmaları tamamlama yükümlülüğü vardır.',
    },
  ],

  'cocugun-cinsel-istismari-ve-zincirleme-suc-hukumleri-yargitay-karari': [
    {
      question: 'Zincirleme suç (TCK 43) nedir?',
      answer:
        'TCK m.43 uyarınca aynı suçun, aynı kişiye karşı, bir suç işleme kararının icrası kapsamında değişik zamanlarda birden fazla işlenmesi hâlinde tek ceza verilir; ancak bu ceza dörtte birinden dörtte üçüne kadar artırılır. Düzenleme, faili lehe sonuç doğuran bir içtima kuralıdır.',
    },
    {
      question: 'Çocuğun 15 yaşını doldurması suçun niteliğini değiştirir mi?',
      answer:
        'TCK m.103 ve m.104 ayrımı doğrudan mağdurun yaşına bağlıdır. 15 yaşını doldurmamış çocuğa karşı eylemler nitelikli cinsel istismar olarak değerlendirilirken, 15 yaşını doldurmuş ancak fiilin hukuki anlamını algılayamayan veya cebir/tehdit kullanılan eylemler de istismar suçunu oluşturur. Mağdurun reşit olmasıyla suç nitelendirmesi, fiilin niteliğine göre değişebilir.',
    },
    {
      question: 'Eylemler 15 yaşından önce ve sonra devam ederse nasıl ceza verilir?',
      answer:
        'Yargıtay 9. Ceza Dairesi’nin emsal kararı uyarınca; mağdurun 15 yaşını doldurması ve eylemlerin devam etmesi hâlinde, 15 yaşından önceki ve sonraki eylemler ayrı suç tipleri kapsamında değerlendirilmekle birlikte, aynı suç işleme kararıyla bağlanan kısımlar yönünden TCK m.43’teki zincirleme suç hükümleri uygulanmalıdır.',
    },
    {
      question: 'Cinsel istismar davalarında zamanaşımı süresi nedir?',
      answer:
        'Çocuğun cinsel istismarı suçunda dava zamanaşımı, suçun nitelikli hâllerine göre TCK m.66 uyarınca 15 ila 30 yıl arasında değişir. Süre, kural olarak suçun işlendiği günden işlemeye başlar; bazı hâllerde mağdurun reşit olduğu tarih esas alınır.',
    },
  ],

  'yargitay-karari-belirli-sureli-tahliye-zamani': [
    {
      question: 'Belirli süreli kira sözleşmesinde ihtiyaç nedeniyle tahliye davası ne zaman açılabilir?',
      answer:
        'Yargıtay 3. Hukuk Dairesi’nin 2025/3930 sayılı ilamı uyarınca, belirli süreli kira sözleşmelerinde kiraya verenin ihtiyaç nedeniyle tahliye davasını ancak sözleşme süresinin sona ermesinden itibaren 1 ay içinde açabilmesi gerekir. Sözleşme süresi dolmadan açılan dava süre yönünden reddedilir.',
    },
    {
      question: 'İhtiyaç nedeniyle tahliyede hangi yakınlar kapsama girer?',
      answer:
        'TBK m.350 uyarınca kiraya veren; kendisi, eşi, altsoyu (çocukları, torunları), üstsoyu (anne, baba) veya kanun gereği bakmakla yükümlü olduğu kişiler için konut ya da işyeri ihtiyacı bulunduğunu ispatlayarak tahliye davası açabilir. İhtiyaç gerçek, samimi ve zorunlu olmalıdır.',
    },
    {
      question: 'Tahliye davasında kaç yıl yeniden kiralama yasağı vardır?',
      answer:
        'TBK m.355 uyarınca ihtiyaç nedeniyle tahliye edilen kiralanan, haklı bir sebep olmadıkça 3 yıl süreyle eski kiracıdan başkasına kiraya verilemez. Bu yasağa aykırı davranış, eski kiracıya son kira yılında ödenen yıllık kira bedelinden az olmamak üzere tazminat hakkı verir.',
    },
    {
      question: 'Tahliye taahhüdü ile ihtiyaç nedeniyle tahliye birlikte ileri sürülebilir mi?',
      answer:
        'Evet. Kiraya veren, mevcut tahliye sebeplerini terditli (kademeli) olarak aynı davada ileri sürebilir. Mahkeme, önce öncelikli sebebi inceler; bu sebep yerinde görülmezse ikinci sebebe geçer.',
    },
  ],

  'sgk-recete-uyusmazligi-yargitay-karari-2025': [
    {
      question: 'Eczane–SGK sözleşmesinde sistem müdahalesi cezai şart doğurur mu?',
      answer:
        'Yargıtay 3. Hukuk Dairesi’nin 01.07.2025 tarihli kararı uyarınca, eczacının MEDULA sistemi üzerinde reçete ve rapor uyumsuzluğunu giderme amaçlı yaptığı müdahaleler, sözleşmede açıkça yasaklandığı hâllerde cezai şart yaptırımına yol açabilir. Cezai şart miktarı, hâkim tarafından TBK m.182’ye göre fahiş bulunması hâlinde indirilebilir.',
    },
    {
      question: 'Eczane uyuşmazlıklarında görevli mahkeme hangisidir?',
      answer:
        'Eczacılar ile SGK arasındaki sözleşmesel ilişkiden doğan alacak ve cezai şart uyuşmazlıkları, taraflar tacir kabul edildiğinden ve sözleşme ticari sayıldığından Asliye Ticaret Mahkemesinde görülür. Konusu para olan taleplerde dava açılmadan önce arabuluculuk dava şartıdır.',
    },
    {
      question: 'SGK protokolünden kaynaklanan uyuşmazlıklarda zamanaşımı süresi nedir?',
      answer:
        'Eczacı–SGK sözleşmesinden doğan alacaklar, niteliği itibarıyla TBK m.146’daki 10 yıllık genel zamanaşımına tâbidir. Cezai şart talepleri de aynı süreye bağlı olarak ileri sürülebilir.',
    },
    {
      question: 'Cezai şart miktarına karşı hâkim indirim yapabilir mi?',
      answer:
        'TBK m.182/3 uyarınca aşırı bulduğu cezai şartı hâkim re’sen indirebilir. Yargıtay, sözleşmenin tarafları arasındaki ekonomik denge, ihlalin ağırlığı ve süresi ile fiilin sonuçlarını gözeterek indirim yapılması gerektiğini kabul etmektedir.',
    },
  ],

  'kasten-oldurmeye-tesebbus-ceza-indirimi-yargitay-2025': [
    {
      question: 'Teşebbüs hâlinde TCK m.35 uyarınca ceza indirimi nasıl yapılır?',
      answer:
        'TCK m.35 uyarınca suça teşebbüsten dolayı fail, meydana gelen zarar veya tehlikenin ağırlığına göre kanunda belirlenen cezanın dörtte birinden dörtte üçüne kadar indirilerek cezalandırılır. İndirim oranı, hâkim tarafından somut olayda gerekçelendirilir.',
    },
    {
      question: 'Mağdurun hayati tehlikesinin bulunmaması indirim oranını etkiler mi?',
      answer:
        'Yargıtay 1. Ceza Dairesi’nin 29.05.2025 tarihli kararı uyarınca; teşebbüs aşamasında kalan kasten öldürmede mağdurda hayati tehlike doğmamışsa, indirim cezanın alt sınırına yakın oranda uygulanmalıdır. Hayati tehlike, kullanılan vasıta ve hedef alınan bölge gibi unsurlar indirim oranının belirlenmesinde dikkate alınır.',
    },
    {
      question: 'Kasten öldürmenin temel cezası nedir? (TCK 81)',
      answer:
        'TCK m.81 uyarınca kasten bir kimsenin öldürülmesi suçunun cezası müebbet hapistir. Suçun nitelikli hâllerinde (TCK 82) ağırlaştırılmış müebbet hapis öngörülmüştür.',
    },
    {
      question: 'Teşebbüsten gönüllü vazgeçme nasıl bir sonuç doğurur?',
      answer:
        'TCK m.36 uyarınca fail icra hareketlerini iradesiyle terk eder veya neticeyi kendi çabasıyla önlerse teşebbüsten dolayı cezalandırılmaz; ancak gerçekleşen kısım başlı başına suç oluşturuyorsa o suçtan sorumlu tutulur.',
    },
  ],

  'hizmet-tespiti-davasi-yargitay-karari-2025': [
    {
      question: 'Hizmet tespiti davası nedir ve kim tarafından açılır?',
      answer:
        '5510 sayılı Kanun m.86 uyarınca, sigortalı çalıştığı hâlde SGK kayıtlarına yansıtılmamış sürelerin tespiti için işçi tarafından, işveren ve SGK aleyhine açılan dava türüdür. Dava, sigortalılık başlangıcı, prim ödeme gün sayısı ve kazanılmış sigorta hakları yönünden belirleyici nitelikte sonuçlar doğurur.',
    },
    {
      question: 'Hizmet tespiti davasında zamanaşımı süresi var mıdır?',
      answer:
        'Hizmet tespiti davası, hizmetin geçtiği yılın sonundan itibaren 5 yıl içinde açılmalıdır. Ancak işveren tarafından sigortalı dönemine ilişkin Kuruma verilmiş aylık prim ve hizmet belgesi varsa bu süre uygulanmaz; dava süreye bağlı olmaksızın açılabilir.',
    },
    {
      question: 'Mahkeme hizmet tespiti davasında hangi araştırmaları yapmalıdır?',
      answer:
        'Yargıtay 10. Hukuk Dairesi’nin 19.02.2025 tarihli kararı uyarınca mahkeme; iş yerinin kayıtlı olup olmadığını, tanıkların aynı dönemde aynı işyerinde sigortalı çalışıp çalışmadığını, bordro ve prim belgelerini, vergi kayıtlarını ve komşu işyeri kayıtlarını kapsamlı biçimde araştırmakla yükümlüdür. Eksik inceleme bozma sebebidir.',
    },
    {
      question: 'Hizmet tespiti davasında ispat aracı olarak neler kullanılabilir?',
      answer:
        'Tanık beyanları, ücret bordroları, işyeri sicil kayıtları, vergi dairesi kayıtları, banka ödeme dekontları, SSK/SGK işyeri tescil belgeleri ve aynı dönemde çalışan resmi tanıkların beyanları başlıca ispat araçlarıdır. Yazılı belgeler tanık beyanlarına göre üstün delil sayılır.',
    },
  ],
};
