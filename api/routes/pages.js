import {
  Router,
} from "express";
import {
  apiRoute,
} from "../helpers/route";
import {
  AuthRouter,
} from "../helpers/middleware";
import {
  roleNames,
} from "../helpers/permissions";

const router = Router();

router.get("/list", apiRoute(() => {
  return [
    {
      name: "page.name.blog",
      to: { name: "PageBlogHome" },
    },
    {
      name: "page.name.about",
      to: { name: "PageAbout" },
    },
    {
      name: "page.name.participants",
      to: { name: "PageSudionici" },
    },
    {
      name: "page.name.contact",
      to: { name: "PageKontakt" },
    },
    {
      name: "page.name.press",
      to: { name: "PagePress" },
    },
    {
      name: "button.joinNow",
      setting: "Join Now URL",
    },
  ];
}));

const authRouter = new AuthRouter({ role: roleNames.MODERATOR });

authRouter.get("/admin", apiRoute(() => {
  return [
    {
      name: "Home",
      to: { name: "PageAdminIndex" },
      exact: true,
      icon: "mdi-home",
    },
    {
      name: "Press",
      to: { name: "PageAdminPressIndex" },
      icon: "mdi-account-voice",
    },
    {
      name: "News",
      to: { name: "PageAdminNewsList" },
      icon: "mdi-newspaper",
    },
    {
      name: "Translations",
      to: { name: "PageAdminTranslationsList" },
      requiredRole: roleNames.ADMIN,
      icon: "mdi-transcribe",
    },
    {
      name: "Settings",
      to: { name: "PageAdminSettingsList" },
      requiredRole: roleNames.ADMIN,
      icon: "mdi-cog",
    },
  ].map(({ requiredRole = roleNames.MODERATOR, ...entry }) => ({ ...entry, requiredRole }));
}));

router.use(authRouter);

export default router;
