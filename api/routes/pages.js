import {
  Router,
} from "express";
import {
  apiRoute,
} from "../helpers/route";

const router = Router();

router.get("/list", apiRoute(() => {
  return [
    {
      name: "Blog",
      to: { name: "PageBlogHome" },
    },
    {
      name: "O MeetUPu",
      to: { name: "PageAbout" },
    },
    {
      name: "Sudionici",
      to: { name: "PageSudionici" },
    },
    {
      name: "Kontakt",
      to: { name: "PageKontakt" },
    },
    {
      name: "Press",
      to: { name: "PagePress" },
    },
    {
      name: "Prijavi se",
      href: "https://jobfair.fer.unizg.hr/",
    },
  ];
}));

export default router;
