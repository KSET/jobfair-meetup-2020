import xml2js from "xml2js";
import {
  get,
} from "../../../helpers/axios";
import {
  cachedFetcher,
  CacheKey,
} from "../../../helpers/fetchCache";

const fetchChannelLiveInfo = cachedFetcher<null | string>(
  "youtube-live",
  15 * 1000,
  async (channelId: string) => {
    const page = await get<string>(
      `https://www.youtube.com/channel/${ channelId }/live`,
      {
        validateStatus: (status) => 404 === status || 200 === status,
      },
    );

    if (!page.includes("<meta name=\"title\"")) {
      return null;
    }

    const xml = await get<string>(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${ channelId }`,
    );

    const data = await xml2js.parseStringPromise(
      xml,
      {
        trim: true,
        normalize: true,
        normalizeTags: true,
      },
    );

    return data?.feed?.entry?.shift()?.id?.pop()?.split(":")?.pop() || null;
  },
  (channelId: string) => channelId as CacheKey,
);

export default class YoutubeService {
  public static async isChannelLive(channelId: string): Promise<boolean> {
    const videoId = await this.getChannelLiveVideoId(channelId);

    return null !== videoId;
  }

  public static async getChannelLiveVideoId(channelId: string): Promise<string | null> {
    try {
      return await fetchChannelLiveInfo(channelId);
    } catch {
      return null;
    }
  }
}
