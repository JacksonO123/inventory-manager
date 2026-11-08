import { orgPositionsTable } from '@invm/inventory-db-utils';
import { OrgPositions as OrgPositionsType } from '../../types/types';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class OrgPositions {
  values: OrgPositionsType;

  constructor(values: OrgPositionsType) {
    this.values = values;
  }

  static async getByUserId(userId: string) {
    const [positions] = await db
      .select()
      .from(orgPositionsTable)
      .where(eq(orgPositionsTable.userId, userId));

    if (positions === undefined) {
      return new OrgPositions({
        id: -1,
        userId,
        positions: []
      });
    }

    return new OrgPositions(positions);
  }

  static async updateByUserId(userId: string, newOrder: number[]) {
    const [res] = await db
      .insert(orgPositionsTable)
      .values({ userId, positions: newOrder })
      .onConflictDoUpdate({
        target: orgPositionsTable.userId,
        set: {
          positions: newOrder
        }
      })
      .returning({ id: orgPositionsTable.id });
    if (res === undefined) {
      throw new Error('Failed to update org positions');
    }
  }
}
