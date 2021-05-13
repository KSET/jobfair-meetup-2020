import {
  RoleNames,
} from "../helpers/permissions";
import {
  AuthRouter,
  Router,
} from "../helpers/route";
import {
  getSetting,
} from "../helpers/settings";
import YoutubeService from "../services/external/google/youtube-service";

const router = new Router();

router.get("/list", async () => {
  const youtubeChannelId = await getSetting("YouTube channel id", "");
  const isYoutubeLive = await YoutubeService.isChannelLive(youtubeChannelId);

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
      showOffline: false,
    },
    isYoutubeLive
    ? {
        name: "page.name.broadcast",
        to: { name: "PageLive" },
      }
    : null,
    {
      name: "page.name.contact",
      to: { name: "PageKontakt" },
    },
    {
      name: "page.name.press",
      to: { name: "PagePress" },
    },
    // {
    //   name: "button.joinNow",
    //   setting: "Join Now URL",
    // },
  ].filter((i) => i).map((p) => ({
    showOffline: true,
    ...p,
  }));
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.MODERATOR });

authRouter.get("/admin", () => {
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
      name: "Event management",
      to: { name: "PageAdminEventIndex" },
      icon: "mdi-eye-settings",
    },
    {
      name: "Site configuration",
      to: { name: "PageAdminConfigurationIndex" },
      icon: "mdi-cog",
    },
  ].map(({ requiredRole = RoleNames.MODERATOR, ...entry }) => ({ ...entry, requiredRole }));
});

export default authRouter;
