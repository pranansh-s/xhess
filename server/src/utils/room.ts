export const generateRoomKey = () => {
  const randomValues = new Uint8Array(8);
  crypto.getRandomValues(randomValues);

  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let key = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) key += '-';
    const index = randomValues[i] % characters.length;
    key += characters[index];
  }

  return key;
};
