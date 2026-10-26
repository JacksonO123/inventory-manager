/**
 * @jest-environment node
 */
import { ZodError } from 'zod';
import { Item } from './Item';
import { db } from '../db';
import { itemTable } from '@invm/inventory-db-utils';

jest.mock('../db', () => ({
  db: { insert: jest.fn(), select: jest.fn() }
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

describe('Item.getAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the rows selected from the item table', async () => {
    const rows = [
      { id: 1, name: 'a', description: 'a' },
      { id: 2, name: 'b', description: 'b' }
    ];
    const from = jest.fn().mockResolvedValue(rows);
    (db.select as jest.Mock).mockReturnValue({ from });

    await expect(Item.getAll()).resolves.toEqual(rows);
    expect(db.select).toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith(itemTable);
  });

  it('returns an empty array when no rows exist', async () => {
    const from = jest.fn().mockResolvedValue([]);
    (db.select as jest.Mock).mockReturnValue({ from });

    await expect(Item.getAll()).resolves.toEqual([]);
    expect(db.select).toHaveBeenCalled();
  });
});
