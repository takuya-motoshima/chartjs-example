export const randData = (length, min = 0, max = 100) => {
  const data = Array.from({length}, () => Math.floor(Math.random() * (max - min) + min));
  return length === 1 ? data[0] : data;
}