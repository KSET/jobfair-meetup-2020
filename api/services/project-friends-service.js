import {
  queryProjectFriendsCreate,
  queryProjectFriendsDeleteById,
  queryProjectFriendsGetAll,
  queryProjectFriendsGetById,
  queryProjectFriendsGetLatest,
  queryProjectFriendsUpdate,
} from "../../db/helpers/projectFriends";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
  pipe,
  withoutKeys,
} from "../../helpers/object";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ApiError,
} from "../helpers/route";
import ImageService from "./image-service";

const format = pipe(
  keysFromSnakeToCamelCase,
  withoutKeys.bind(null, [ "imageId" ]),
);

export default class ProjectFriendsService {
  static async create(
    {
      name,
      link,
      image: imageFile,
    },
    uploaderId,
  ) {
    const item = {
      name,
      link,
    };

    if (!imageFile || !name || !link) {
      throw new ApiError(
        "All fields required",
      );
    }

    const client = await Client.inTransaction();
    try {
      const latestProjectFriend = await client.queryOne(queryProjectFriendsGetLatest());
      item.order = (latestProjectFriend && latestProjectFriend.order) || 0;
      item.order += 1;

      const images = await ImageService.upload(imageFile, uploaderId);
      const { default: image } = images;
      item.imageId = image.imageId;

      const newProjectFriend = await client.queryOne(queryProjectFriendsCreate(item));

      await client.commit();

      return this.Format(newProjectFriend, Object.values(images));
    } catch (e) {
      await client.rollback();

      if (item.imageId) {
        await ImageService.remove(item.imageId);
      }

      throw e;
    } finally {
      await client.end();
    }
  }

  static async list() {
    const partners = await Client.queryOnce(queryProjectFriendsGetAll());
    const images = await ImageService.listInfo(...partners.map(({ image_id: id }) => id));
    const imageMap =
      images
        .reduce((acc, image) => {
          const { imageId: id, ...data } = image;
          if (!(id in acc)) {
            acc[id] = [];
          }

          acc[id].push(data);

          return acc;
        }, {})
    ;

    return (
      partners
        .sort((a, b) => a.order - b.order)
        .map(
          (partner) =>
            this.Format(
              partner,
              imageMap[partner.image_id],
            )
          ,
        )
    );
  }

  static async remove(id) {
    const client = await Client.inTransaction();

    try {
      const partner = await client.queryOne(queryProjectFriendsGetById({ id }));

      if (!partner) {
        return true;
      }

      const { image_id: imageId } = partner;

      await client.query(queryProjectFriendsDeleteById({ id }));
      const removed = await ImageService.remove(imageId, client);

      if (!removed) {
        throw new ApiError("Something went wrong");
      }

      await client.commit();

      return true;
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }

  static async swap(a, b) {
    const client = await Client.inTransaction();

    try {
      const A = await client.queryOne(queryProjectFriendsGetById({ id: a }));
      const B = await client.queryOne(queryProjectFriendsGetById({ id: b }));

      if (!A || !B) {
        throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
          "Partner not found",
        ]);
      }

      await client.query(queryProjectFriendsUpdate(a, { order: B.order }));
      await client.query(queryProjectFriendsUpdate(b, { order: A.order }));

      await client.commit();

      return true;
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }

  static Format(partner, images) {
    return format({
      ...partner,
      images,
    });
  }
}
