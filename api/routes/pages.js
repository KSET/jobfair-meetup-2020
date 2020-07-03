import {
  Router,
} from "express";
import {
  apiRoute,
} from "../helpers/route";
import {
  requireAuth,
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

router.get("/admin", requireAuth({ role: roleNames.MODERATOR }), apiRoute(() => {
  return [
    {
      name: "Home",
      to: { name: "PageAdminIndex" },
      exact: true,
    },
    {
      name: "Press",
      to: { name: "PageAdminPressIndex" },
    },
    {
      name: "News",
      to: { name: "PageAdminNewsList" },
    },
    {
      name: "Translations",
      to: { name: "PageAdminTranslationsList" },
      requiredRole: roleNames.ADMIN,
    },
    {
      name: "Settings",
      to: { name: "PageAdminSettingsList" },
      requiredRole: roleNames.ADMIN,
    },
  ].map(({ requiredRole = roleNames.MODERATOR, ...entry }) => ({ ...entry, requiredRole }));
}));

export default router;
