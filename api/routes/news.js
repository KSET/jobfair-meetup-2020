import {
  Router,
} from "express";
import {
  success,
  error,
} from "../helpers";

const router = Router();

let i = 0;

const filler =
  [
    {
      title: "Ostajemo doma: Otkazan ovogodišnji Job Fair",
      text: "S obzirom na neizvjesnost razvoja situacije s virusom COVID-19 te sukladno smjernicama Nacionalnog stožera civilne zaštite i Vlade Republike Hrvatske.",
    },
    {
      title: "Budi IN na LinkedInu za 15. Job Fair!",
      text: "Dok marljivo pripremaš svoj životopis za bazu životopisa koja je odnedavno otvorena, želimo ti približiti još jedan način kako se dodatno možeš  istaknuti na 15. Job Fairu.",
    },
    {
      title: "Time to shine - baza životopisa za 15. Job Fair službeno je otvorena!",
      text: "Pripremi se - lov na karijere uskoro počinje! Ovogodišnji Job Fair, koji će se održati 13. i 14. svibnja na  Fakultetu elektrotehnike i računarstva donosi mnogo poslovnih prilika!",
    },
  ]
;

const data =
  [
    {
      title: "Otvorene prijave za poduzeća na petnaestom Job Fairu",
      text: "Tijekom 13. i 14. svibnja, na  Fakultetu elektrotehnike i računarstva tradicionalno će se održati Job Fair - najveći sajam poslova u Hrvatskoj - čime će FER još jednom postati žarišna točka okupljanja nekoliko tisuća studenata i preko sto poduzeća!",
    },
    ...filler,
    ...filler,
    ...filler,
  ].map(
    (news) =>
      ({
        ...news,
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
        description: news.text.substr(0, 150),
        image: `https://picsum.photos/id/${ i + 20 }/1920/1080`,
        imageThumbnail: `https://picsum.photos/id/${ i + 20 }/178/100`,
        date: new Date(Date.now() - (Math.random() * 3 * 24 * 60 * 60 * 1000) * (i - 1)),
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
