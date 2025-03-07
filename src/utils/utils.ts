// Generates a random ID to keep track of requests
export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};
