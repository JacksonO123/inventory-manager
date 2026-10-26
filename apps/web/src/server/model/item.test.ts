/**
 * @jest-environment node
 */
import { ZodError } from 'zod';
import { Item } from './Item';
import { db } from '../db';

jest.mock('../db', () => ({
  db: { insert: jest.fn() }
}));
jest.mock('@invm/inventory-db-utils', () => ({
  itemTable: {}
}));

describe('Item.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valid create', async () => {
    const input = { name: 'x', description: 'x' };
    const returning = jest.fn().mockResolvedValue([{ id: 1, ...input }]);
    const values = jest.fn().mockReturnValue({ returning });
    (db.insert as jest.Mock).mockReturnValue({ values });

    await expect(Item.create(input)).resolves.toBeInstanceOf(Item);
    expect(db.insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(input);
  });

  it('throws a ZodError for an empty name and never touches the DB', async () => {
    await expect(Item.create({ name: '', description: 'x' })).rejects.toBeInstanceOf(ZodError);
    expect(db.insert).not.toHaveBeenCalled();
  });
});
