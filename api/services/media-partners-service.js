import {
  queryMediaPartnersCreate,
  queryMediaPartnersDeleteById,
  queryMediaPartnersGetAll,
  queryMediaPartnersGetById,
  queryMediaPartnersGetLatest,
  queryMediaPartnersUpdate,
} from "../../db/helpers/mediaPartners";
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
  ServiceError,
} from "./error-service";
import ImageService from "./image-service";

const format = pipe(
  keysFromSnakeToCamelCase,
  withoutKeys.bind(null, [ "imageId" ]),
);

export class MediaPartnersError extends ServiceError {
}

export default class MediaPartnersService {
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
      throw new MediaPartnersError("Sva polja su obavezna");
    }

    const client = await Client.inTransaction();
    try {
      const latestMediaPartner = await client.queryOne(queryMediaPartnersGetLatest());
      item.order = (latestMediaPartner && latestMediaPartner.order) || 0;
      item.order += 1;

      const images = await ImageService.upload(imageFile, uploaderId);
      const { default: image } = images;
      item.imageId = image.imageId;

      const newMediaPartner = await client.queryOne(queryMediaPartnersCreate(item));

      await client.commit();

      return this.Format(newMediaPartner, Object.values(images));
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
    const partners = await Client.queryOnce(queryMediaPartnersGetAll());
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
      const partner = await client.queryOne(queryMediaPartnersGetById({ id }));

      if (!partner) {
        return true;
      }

      const { image_id: imageId } = partner;

      await client.query(queryMediaPartnersDeleteById({ id }));
      const removed = await ImageService.remove(imageId, client);

      if (!removed) {
        throw new MediaPartnersError("Nešto je pošlo po zlu");
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
      const A = await client.queryOne(queryMediaPartnersGetById({ id: a }));
      const B = await client.queryOne(queryMediaPartnersGetById({ id: b }));

      if (!A || !B) {
        throw new MediaPartnersError("Partner nije pronađen", null, HttpStatus.Error.Client.NotFound);
      }

      await client.query(queryMediaPartnersUpdate(a, { order: B.order }));
      await client.query(queryMediaPartnersUpdate(b, { order: A.order }));

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
