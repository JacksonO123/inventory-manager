import { basicUserTable } from '@invm/inventory-db-utils';
import { BasicUser as BasicUserType, PartialBasicUser } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class BasicUser {
  values: BasicUserType;

  constructor(values: BasicUserType) {
    this.values = values;
  }

  static async create(partialUser: PartialBasicUser) {
    const [res] = await db
      .insert(basicUserTable)
      .values(partialUser)
      .returning({ id: basicUserTable.id });

    if (res === undefined) {
      throw new Error('Failed to create user');
    }

    return res.id;
  }

  static async getByEmail(email: string) {
    const [user] = await db
      .selectDistinct()
      .from(basicUserTable)
      .where(eq(basicUserTable.email, email))
      .limit(1);
    return user ?? null;
  }
}
