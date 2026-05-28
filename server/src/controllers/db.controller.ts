import FirebaseService from '../databases/firebase.database.js';
import RedisService from '../databases/redis.database.js';

import { DatabaseError } from '../utils/error.js';

class DatabaseController {
  private static instance: DatabaseController = new DatabaseController();
  private redis: RedisService;
  private firebase: FirebaseService;

  private constructor() {
    this.redis = new RedisService();
    this.firebase = new FirebaseService();

    this.redis.connect();
  }

  static getInstance(): DatabaseController {
    return this.instance;
  }

  loadData = async <T extends object>(prefix: string, id: string): Promise<T | null> => {
    const cacheKey = `${prefix}:${id}`;
    let cachedData: T | null = null;

    try {
      cachedData = await this.redis.getItem<T>(cacheKey);
    } catch (err) {
      console.warn(`Redis read failed for ${cacheKey}. Falling back directly to Firestore:`, err);
    }

    if (cachedData) {
      return cachedData;
    }

    try {
      const data = await this.firebase.getDoc<T>(prefix, id);
      if (!data) {
        return null;
      }

      try {
        await this.redis.setItem<T>(cacheKey, data);
      } catch (err) {
        console.warn(`Redis cache update failed for ${cacheKey}:`, err);
      }

      return data;
    } catch (err) {
      console.error(`Database load operation failed for Firestore at ${prefix}/${id}:`, err);
      throw new DatabaseError();
    }
  };

  saveData = async <T extends object>(prefix: string, data: T, id: string) => {
    const cacheKey = `${prefix}:${id}`;
    try {
      await this.firebase.setDoc<T>(prefix, id, data);
    } catch (err) {
      console.error(`Database save operation failed for Firestore at ${prefix}/${id}:`, err);
      throw new DatabaseError();
    }

    try {
      await this.redis.setItem<T>(cacheKey, data);
    } catch (err) {
      console.warn(`Redis cache update failed for ${cacheKey}:`, err);
    }
  };

  deleteData = async (prefix: string, id: string) => {
    const cacheKey = `${prefix}:${id}`;
    try {
      await this.firebase.removeDoc(prefix, id);
    } catch (err) {
      console.error(`Database delete operation failed for Firestore at ${prefix}/${id}:`, err);
      throw new DatabaseError();
    }

    try {
      await this.redis.removeItem(cacheKey);
    } catch (err) {
      console.warn(`Redis cache evict failed for ${cacheKey}:`, err);
    }
  };
}

export default DatabaseController.getInstance();
