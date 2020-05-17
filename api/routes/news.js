import {
  Router,
} from "express";
import {
  success,
  error,
} from "../helpers/route";

const router = Router();

let i = 0;

const filler =
  [
    {
      title: "Ostajemo doma: Otkazan ovogodišnji Job Fair",
      description: "S obzirom na neizvjesnost razvoja situacije s virusom COVID-19 te sukladno smjernicama Nacionalnog stožera civilne zaštite i Vlade Republike Hrvatske.",
    },
    {
      title: "Budi IN na LinkedInu za 15. Job Fair!",
      description: "Dok marljivo pripremaš svoj životopis za bazu životopisa koja je odnedavno otvorena, želimo ti približiti još jedan način kako se dodatno možeš  istaknuti na 15. Job Fairu.",
    },
    {
      title: "Time to shine - baza životopisa za 15. Job Fair službeno je otvorena!",
      description: "Pripremi se - lov na karijere uskoro počinje! Ovogodišnji Job Fair, koji će se održati 13. i 14. svibnja na  Fakultetu elektrotehnike i računarstva donosi mnogo poslovnih prilika!",
    },
  ]
;

const data =
  [
    {
      title: "Otvorene prijave za poduzeća na petnaestom Job Fairu",
      description: "Tijekom 13. i 14. svibnja, na  Fakultetu elektrotehnike i računarstva tradicionalno će se održati Job Fair - najveći sajam poslova u Hrvatskoj - čime će FER još jednom postati žarišna točka okupljanja nekoliko tisuća studenata i preko sto poduzeća!",
      content: "<h2>Uključite se na vrijeme</h2><p><strong>Prijave</strong> za poduzeća su otvorene <strong>do 21. veljače</strong>, a prijaviti se možete na internetskoj stranici Job Faira. Prijavom na sajam možete dobiti svoje mjesto na jedinstvenom, dvodnevnom događanju koje svake godine okuplja perspektivne studente i uspješna poduzeća - upravo zato vas pozivamo da na vrijeme osigurate svoje mjesto! Ponudu za ovogodišnji Job Fair možete zatražiti putem službene adrese e-pošte: <a href=\"mailto:jobfair@fer.hr\">jobfair@fer.hr</a>.</p><figure class=\"image\"><img src=\"https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png\" srcset=\"https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_144 144w, https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_224 224w, https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_304 304w, https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_384 384w, https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_464 464w, https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_544 544w, https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/00d899f721fce556949faadb1873975e476ef03b07254613.png/w_624 624w\" sizes=\"100vw\" width=\"624\"><figcaption>caption</figcaption></figure><h3>Petnaesti Job Fair obilježit će tematski talkovi</h3><p>Nakon četrnaest godina rasta i razvoja, ovogodišnji Job Fair prerasta klasični oblik sajma i poprima ton konferencije. Glavna nova njegova sastavnica su tematski <i><strong>talkovi</strong></i>, koji poduzećima pružaju priliku da u dvadeset minuta ispričaju svoju poslovnu priču studentima i dočaraju im kako izgleda jedan <i><strong>radni dan u njihovom poduzeću</strong></i> ili pak objasne zašto je njihova tehnologija inovativna i konkurentna na tržištu. Svjetski trendovi pokazuju da talkovi studentima predstavljaju zanimljiv način na koji mogu saznati više o željenom poduzeću, a poslodavci dobivaju njihovu punu pažnju na kratko, ali dragocjeno vrijeme!</p><blockquote><p>Osim podjele informacija, na Job Fairu će se održati i inspirativne radionice namijenjene pružanju konkretnog znanja o specifičnom području kojim se određeno poduzeće bavi.</p></blockquote><p>U srodnim fakultetima ima dosta, pružiti prilika za neformalnim oblikom učenja koji je danas kod studenata veoma aktualan. Talkovi će se uživo moći pratiti u KSET-u, a izravno će se prenositi na Job Fair YouTube kanalu.</p><h3>Petnaesti Job Fair obilježit će tematski talkovi</h3><p>Nakon četrnaest godina rasta i razvoja, ovogodišnji Job Fair prerasta klasični oblik sajma i poprima ton konferencije. Glavna nova njegova sastavnica su tematski <i><strong>talkovi</strong></i>, koji poduzećima pružaju priliku da u dvadeset minuta ispričaju svoju poslovnu priču studentima i dočaraju im kako izgleda jedan <i><strong>radni dan u njihovom poduzeću</strong></i> ili pak objasne zašto je njihova tehnologija inovativna i konkurentna na tržištu. Svjetski trendovi pokazuju da talkovi studentima predstavljaju zanimljiv način na koji mogu saznati više o željenom poduzeću, a poslodavci dobivaju njihovu punu pažnju na kratko, ali dragocjeno vrijeme!</p><h2>Uključite se na vrijeme</h2><h3>Petnaesti Job Fair obilježit će tematski talkovi</h3><p><strong>Prijave</strong> za poduzeća su otvorene <strong>do 21. veljače</strong>, a prijaviti se možete na internetskoj stranici Job Faira. Prijavom na sajam možete dobiti svoje mjesto na jedinstvenom, dvodnevnom događanju koje svake godine okuplja perspektivne studente i uspješna poduzeća - upravo zato vas pozivamo da na vrijeme osigurate svoje mjesto! Ponudu za ovogodišnji Job Fair možete zatražiti putem službene adrese e-pošte:</p><ul><li>prijavom na sajam možete dobiti svoje mjesto na jedinstvenom događanju</li><li>pozivamo vas da na vrijeme osigurate svoje mjesto</li><li>Iako je bogati dnevni program itekako dovoljan za uspješan lov na nove karijere, posjetitelji će po završetku prvog dana sajma moći uživati u opuštenoj atmosferi</li></ul><p>Za više informacija pratite našu internetsku stranicu, Facebook stranicu i Instagram profil. Sajam organiziraju <a href=\"https://fer.hr\">FER</a>, <a href=\"https://karijere.fer.hr/\">Centar karijera FER-a</a>, <a href=\"http://www.ssfer.hr/\">Savez studenata FER-a (SS FER)</a> i <a href=\"https://www.kset.org\">Klub studenata elektrotehnike (KSET)</a>.</p>",
    },
    ...filler,
    ...filler,
    ...filler,
  ].map(
    (news) =>
      ({
        id: ++i,
        slug:
          `${
            news
              .title
              .toLowerCase()
              .replace(/\W/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-+|-+$/g, "")
          }-${ i }`,
        content: news.description,
        image: `https://picsum.photos/id/${ i + 20 }/1920/1080`,
        imageThumbnail: `https://picsum.photos/id/${ i + 20 }/178/100`,
        date: new Date(Date.now() - (Math.random() * 3 * 24 * 60 * 60 * 1000) * (i - 1)),
        ...news,
      })
    ,
  )
;

router.get("/list", (req, res) => {
  res.json(success(data));
});

router.get("/item/:slug", (req, res) => {
  const item = data.find(({ slug }) => slug === req.params.slug);

  const resp =
    item
    ? success(item)
    : error({ status: 404, reason: "not-found" })
  ;

  res.json(resp);
});

export default router;
