const aliasMap = {
  "og:title": [ "apple-mobile-web-app-title" ],
};

const renameMap = {
  title: "og:title",
  description: "og:description",
  image: "og:image",
  type: "og:type",
};

const mappedContent = {
  "og:title": (title) => `${ title } | JobFair MeetUP`,
};

const getMappedContent = (key, content) => mappedContent[key] ? mappedContent[key](content) : content;
const getRenamedKey = (key) => renameMap[key] || key;
const getKeyAliases = (key) => aliasMap[key] || [];
const getKeyWithAliases = (key) => [ key, ...getKeyAliases(key) ];

export const hid = ({ name, content }) => ({ hid: name, name, content });

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
          getKeyWithAliases(key)
            .map(
              (name) =>
                hid({ name, content })
              ,
            )
        ,
      )
;

