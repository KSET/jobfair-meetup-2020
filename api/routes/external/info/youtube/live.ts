import {
  Router,
} from "../../../../helpers/route";
import {
  getSetting,
} from "../../../../helpers/settings";
import YoutubeService from "../../../../services/external/google/youtube-service";

const router = new Router();

router.get("/video-id", async (): Promise<string | null> => {
  const channelId: string = await getSetting("YouTube channel id");

  if (!channelId) {
    return null;
  }

  return await YoutubeService.getChannelLiveVideoId(channelId);
});

router.get("/is-live", async (): Promise<boolean> => {
  const channelId: string = await getSetting("YouTube channel id");

  if (!channelId) {
    return false;
  }

  return await YoutubeService.isChannelLive(channelId);
});

export default router;
