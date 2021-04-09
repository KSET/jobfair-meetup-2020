const aliasMap = {
  "og:title": [ "apple-mobile-web-app-title" ],
  locale: [ "og:locale" ],
};

const renameMap = {
  title: "og:title",
  description: "og:description",
  image: "og:image",
  type: "og:type",
};

const mappedContent = {
  "og:title": (title) => `${ title } | Job Fair Meetup`,
  "og:image": (imageUrl) => {
    if (!imageUrl.startsWith(process.env.BASE_URL)) {
      imageUrl = process.env.BASE_URL + imageUrl;
    }

    return imageUrl;
  },
};

const hid = ({ name, content }) =>
  name.startsWith("og:")
  ? ({ hid: name, property: name, content })
  : ({ hid: name, name, content })
;

const getMappedContent = (key, content) => mappedContent[key] ? mappedContent[key](content) : content;
const getRenamedKey = (key) => renameMap[key] || key;
const getKeyAliases = (key) => aliasMap[key] || [];
const getKeyWithAliases =
  (key, content) =>
    [
      key,
      ...getKeyAliases(key),
    ]
      .map((name) => hid({ name, content }))
;

export const generateMetadata =
  (pageData) =>
    Object
      .entries(pageData)
      .map(
        ([ key, content ]) => {
          const newKey = String(getRenamedKey(key));
          const newContent = String(getMappedContent(newKey, content));

          return [ newKey, newContent ];
        },
      )
      .flatMap(
        ([ key, content ]) =>
          getKeyWithAliases(key, content)
        ,
      )
;

