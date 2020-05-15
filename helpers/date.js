export const formatDate = (dateStr) => {
  const zeroPad = (n) => 9 < n ? String(n) : `0${ n }`;
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = zeroPad(date.getMonth() + 1);
  const day = zeroPad(date.getDate());

  return `${ day }.${ month }.${ year }.`;
};
