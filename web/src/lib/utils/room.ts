import { post_create_room } from '@/lib/api';

export const formatRoomKey = (val: string) => {
  const cleaned = val.replace(/[^a-z0-9]/gi, '');
  return cleaned
    .slice(0, 8)
    .replace(/(\w{4})(\w{0,4})/, '$1-$2')
    .toLowerCase();
};

export const createRoom = async () => {
  const res = await post_create_room();
  const id = res.data.key;
  return id;
};
