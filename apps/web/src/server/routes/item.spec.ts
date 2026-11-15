/**
 * @jest-environment node
 */
import { nextItemRoute } from './item';
import { Item } from '../model/Item';
import { HttpError } from '../errors';

jest.mock('../model/Item', () => ({
  Item: {
    create: jest.fn(),
    getAll: jest.fn(),
    checkOut: jest.fn(),
    return: jest.fn(),
    delete: jest.fn()
  }
}));

const route = nextItemRoute as any;

describe('nextItemRoute.createItem', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates the item and returns its id and flags', async () => {
    const body = { name: 'Laptop', description: 'Dell' };
    (Item.create as jest.Mock).mockResolvedValue({
      values: { id: 1, is_available: true, is_lent_out: false, is_damaged: false }
    });

    await expect(route.createItem({ body })).resolves.toEqual({
      status: 200,
      body: { id: 1, is_available: true, is_lent_out: false, is_damaged: false }
    });
    expect(Item.create).toHaveBeenCalledWith(body);
  });

  it('returns 500 when creating the item throws', async () => {
    (Item.create as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.createItem({ body: { name: 'x', description: 'x' } })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('nextItemRoute.getItems', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns every item', async () => {
    const items = [
      { id: 1, name: 'a', description: 'a' },
      { id: 2, name: 'b', description: 'b' }
    ];
    (Item.getAll as jest.Mock).mockResolvedValue(items);

    await expect(route.getItems()).resolves.toEqual({ status: 200, body: items });
  });

  it('returns an empty list when there are no items', async () => {
    (Item.getAll as jest.Mock).mockResolvedValue([]);

    await expect(route.getItems()).resolves.toEqual({ status: 200, body: [] });
  });

  it('returns 500 when the query throws', async () => {
    (Item.getAll as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.getItems()).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('nextItemRoute.checkOut', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('checks the item out to the borrower and returns its id', async () => {
    (Item.checkOut as jest.Mock).mockResolvedValue(undefined);

    await expect(route.checkOut({ params: { id: 1 }, body: { borrowerId: 7 } })).resolves.toEqual({
      status: 200,
      body: { id: 1 }
    });
    expect(Item.checkOut).toHaveBeenCalledWith(1, 7);
  });

  it('returns 404 when the item or borrower is not found', async () => {
    (Item.checkOut as jest.Mock).mockRejectedValue(new HttpError(404, 'Item not found'));

    await expect(route.checkOut({ params: { id: 1 }, body: { borrowerId: 7 } })).resolves.toEqual({
      status: 404,
      body: { message: 'Item not found' }
    });
  });

  it('returns 409 when the item is not available', async () => {
    (Item.checkOut as jest.Mock).mockRejectedValue(new HttpError(409, 'Item is not available'));

    await expect(route.checkOut({ params: { id: 1 }, body: { borrowerId: 7 } })).resolves.toEqual({
      status: 409,
      body: { message: 'Item is not available' }
    });
  });

  it('returns 500 when something other than an HttpError throws', async () => {
    (Item.checkOut as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.checkOut({ params: { id: 1 }, body: { borrowerId: 7 } })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('nextItemRoute.returnItem', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the item and returns its id', async () => {
    (Item.return as jest.Mock).mockResolvedValue(undefined);

    await expect(route.returnItem({ params: { id: 1 } })).resolves.toEqual({
      status: 200,
      body: { id: 1 }
    });
    expect(Item.return).toHaveBeenCalledWith(1);
  });

  it('returns 404 when the item is not found', async () => {
    (Item.return as jest.Mock).mockRejectedValue(new HttpError(404, 'Item not found'));

    await expect(route.returnItem({ params: { id: 1 } })).resolves.toEqual({
      status: 404,
      body: { message: 'Item not found' }
    });
  });

  it('returns 500 when something other than an HttpError throws', async () => {
    (Item.return as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.returnItem({ params: { id: 1 } })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});

describe('nextItemRoute.deleteItem', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('deletes the item and returns its id', async () => {
    (Item.delete as jest.Mock).mockResolvedValue(undefined);

    await expect(route.deleteItem({ params: { id: 1 } })).resolves.toEqual({
      status: 200,
      body: { id: 1 }
    });
    expect(Item.delete).toHaveBeenCalledWith(1);
  });

  it('returns 404 when the item is not found', async () => {
    (Item.delete as jest.Mock).mockRejectedValue(new HttpError(404, 'Item not found'));

    await expect(route.deleteItem({ params: { id: 999 } })).resolves.toEqual({
      status: 404,
      body: { message: 'Item not found' }
    });
  });

  it('returns 409 when the item is lent out', async () => {
    (Item.delete as jest.Mock).mockRejectedValue(new HttpError(409, 'Item is currently lent out'));

    await expect(route.deleteItem({ params: { id: 1 } })).resolves.toEqual({
      status: 409,
      body: { message: 'Item is currently lent out' }
    });
  });

  it('returns 500 when something other than an HttpError throws', async () => {
    (Item.delete as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.deleteItem({ params: { id: 1 } })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});
