const zeroPad = (n) => String(n).padStart(2, "0");

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${ day }. ${ month }. ${ year }.`;
};

export const parseDate = (formattedDate) => {
  const [
    day,
    month,
    year,
  ] = formattedDate.split(".").map(Number).map(zeroPad);

  return new Date(`${ year }-${ month }-${ day }`);
};
