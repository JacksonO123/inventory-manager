import { user } from '@invm/inventory-db-utils';
import type { User as UserType } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class User {
  values: UserType;

  constructor(values: UserType) {
    this.values = values;
  }

  static async getById(userId: string) {
    const [res] = await db.select().from(user).where(eq(user.id, userId));
    return res;
  }

  static async getByEmail(email: string) {
    const [res] = await db.select().from(user).where(eq(user.email, email));
    return res;
  }
}
