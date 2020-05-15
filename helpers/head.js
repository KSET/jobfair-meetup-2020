const aliasMap = {
  "og:title": [ "apple-mobile-web-app-title" ],
};

const renameMap = {
  title: "og:title",
  description: "og:description",
  image: "og:image",
  type: "og:type",
};

const getRenamedKey = (key) => renameMap[key] || key;
const getKeyAliases = (key) => aliasMap[key] || [];
const getKeyWithAliases = (key) => [ key, ...getKeyAliases(key) ];

export const hid = ({ name, content }) => ({ hid: name, name, content });

export const generateMetadata =
  (pageData) =>
    Object
      .entries(pageData)
      .map(
        ([ key, content ]) =>
          [ String(getRenamedKey(key)), String(content) ]
        ,
      )
      .flatMap(
        ([ key, content ]) =>
          getKeyWithAliases(key)
            .map(
              (name) =>
                hid({ name, content })
              ,
            )
        ,
      )
;

