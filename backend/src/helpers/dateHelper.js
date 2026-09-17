const nowISO = () => new Date().toISOString();

const addHours = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

module.exports = {
  nowISO,
  addHours,
};
