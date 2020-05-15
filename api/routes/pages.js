import {
  Router,
} from "express";
import {
  apiRoute,
} from "../helpers";

const router = Router();

router.get("/list", apiRoute(() => {
  return [
    {
      name: "Blog",
      to: { name: "Blog:Home" },
    },
    {
      name: "O MeetUPu",
      to: { name: "About" },
    },
    {
      name: "Sudionici",
      to: { name: "Sudionici" },
    },
    {
      name: "Kontakt",
      to: { name: "Kontakt" },
    },
    {
      name: "Press",
      to: { name: "Press" },
    },
    {
      name: "Prijavi se",
      href: "https://jobfair.fer.unizg.hr/",
    },
  ];
}));

export default router;
