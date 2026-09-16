export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(date));
};
