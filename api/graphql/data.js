/* eslint-disable camelcase */

export const basicFields =
  (...keys) =>
    Object.fromEntries(
      keys
        .flat()
        .map(
          (key) =>
            [ key, "required" ]
          ,
        )
      ,
    )
;

export const basicImageVariant = {
  ...basicFields(
    "url",
    "width",
    "height",
  ),
};

export const basicImage = {
  original: basicImageVariant,
  large: basicImageVariant,
  medium: basicImageVariant,
  small: basicImageVariant,
};

export const presentation = {
  ...basicFields(
    "id",
  ),
};

export const industry = {
  ...basicFields(
    "id",
    "name",
  ),
};

export const companyData = {
  ...basicFields(
    "id",
    "name",
    "brand_name",
    "vat_number",
    "short_description",
    "homepage_url",
    "address",
  ),
  logo: basicImage,
  cover: basicImage,
  industry,
};

export const basicUserData = {
  ...basicFields(
    "id",
    "email",
    "name",
    "role",
  ),
};

export const userData = {
  ...basicFields(
    "id",
    "email",
    "first_name",
    "last_name",
    "name",
    "role",
  ),
  companies: companyData,
};

export const tokenData = {
  ...basicFields(
    "token",
  ),
  user: userData,
};

export const loginData = {
  ...basicFields(
    "refresh_token",
  ),
  ...tokenData,
};
