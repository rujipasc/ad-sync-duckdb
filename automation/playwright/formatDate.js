export const yyyymmdd = () => {
  return new Date().toISOString().slice(0,10).replace(/-/g, "");
};