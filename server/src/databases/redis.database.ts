import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient as createNativeClient, RedisClientType } from 'redis';

class RedisService {
  private nativeClient: RedisClientType | null = null;
  private upstashClient: UpstashRedis | null = null;
  private readonly isProduction = process.env.NODE_ENV === 'production';

  private readonly TTL_MIN = 60;

  constructor() {
    if (this.isProduction) {
      this.upstashClient = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      console.log('Upstash Redis initialized');
    } else {
      this.nativeClient = createNativeClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
      this.initEventListeners();
    }
  }

  private initEventListeners = () => {
    if (!this.nativeClient) return;
    this.nativeClient.on('connect', () => console.log('Local Redis connected'));
    this.nativeClient.on('error', err => console.error('Local Redis error:', err));
    this.nativeClient.on('end', () => console.log('Local Redis disconnected'));
  };

  getItem = async <T extends object>(key: string): Promise<T | null> => {
    try {
      if (this.isProduction) {
        return await this.upstashClient!.get<T>(key);
      } else {
        const data = await this.nativeClient!.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (err) {
      console.error('Redis GET failed:', err);
      throw new Error();
    }
  };

  setItem = async <T extends object>(key: string, value: T) => {
    try {
      if (this.isProduction) {
        return this.upstashClient!.set(key, value, { ex: this.TTL_MIN * 60 });
      } else {
        return this.nativeClient!.set(key, JSON.stringify(value), {
          EX: this.TTL_MIN * 60,
        });
      }
    } catch (err) {
      console.error('Redis SET failed:', err);
      throw new Error();
    }
  };

  removeItem = async (key: string) => {
    try {
      if (this.isProduction) {
        return this.upstashClient!.del(key);
      } else {
        return this.nativeClient!.del(key);
      }
    } catch (err) {
      console.error('Redis DEL failed:', err);
      throw new Error();
    }
  };

  connect = async () => {
    if (!this.isProduction) {
      await this.nativeClient!.connect();
    }
  };

  disconnect = async () => {
    if (!this.isProduction) {
      await this.nativeClient!.quit();
    }
  };
}

export default RedisService;
