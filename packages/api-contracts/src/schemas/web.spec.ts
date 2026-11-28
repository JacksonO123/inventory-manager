import {
  itemSchema,
  partialItemSchema,
  basicUserSchema,
  basicUserSchemaOmitId,
  adminSchema,
  partialAdminSchema,
  userSchema,
  orgSchema,
  orgPositionsSchema,
  reservationSchema,
  unrefinedReservationSchema,
  partialReservationSchema,
  orgMemberSchema,
  reservationStatusEnum
} from './web';

const validItem = { id: 1, name: 'HDMI cable', description: 'A cable', status: 'available' as const };

describe('itemSchema', () => {
  it('parses a valid item', () => {
    expect(itemSchema.parse(validItem)).toEqual(validItem);
  });

  it('trims the name and description', () => {
    expect(itemSchema.parse({ ...validItem, name: '  padded  ', description: ' padded ' })).toEqual({
      ...validItem,
      name: 'padded',
      description: 'padded'
    });
  });

  it('rejects a blank name', () => {
    expect(itemSchema.safeParse({ ...validItem, name: '   ' }).success).toBe(false);
  });

  it('rejects a blank non-null description but allows null', () => {
    expect(itemSchema.safeParse({ ...validItem, description: '  ' }).success).toBe(false);
    expect(itemSchema.safeParse({ ...validItem, description: null }).success).toBe(true);
  });

  it.each(['available', 'booked', 'out_of_service'])('accepts the status %s', (status) => {
    expect(itemSchema.safeParse({ ...validItem, status }).success).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(itemSchema.safeParse({ ...validItem, status: 'lost' }).success).toBe(false);
  });

  it('rejects a negative or non-integer id', () => {
    expect(itemSchema.safeParse({ ...validItem, id: -1 }).success).toBe(false);
    expect(itemSchema.safeParse({ ...validItem, id: 1.5 }).success).toBe(false);
  });
});

describe('partialItemSchema', () => {
  it('parses without id and status', () => {
    expect(partialItemSchema.parse({ name: 'HDMI cable', description: null })).toEqual({
      name: 'HDMI cable',
      description: null
    });
  });

  it('still rejects a blank name', () => {
    expect(partialItemSchema.safeParse({ name: '', description: null }).success).toBe(false);
  });
});

describe('basicUserSchema', () => {
  const validUser = { id: 1, name: 'Alice', email: 'alice@example.com' };

  it('parses a valid user', () => {
    expect(basicUserSchema.parse(validUser)).toEqual(validUser);
  });

  it('rejects an invalid email', () => {
    expect(basicUserSchema.safeParse({ ...validUser, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a negative id', () => {
    expect(basicUserSchema.safeParse({ ...validUser, id: -1 }).success).toBe(false);
  });
});

describe('basicUserSchemaOmitId', () => {
  it('parses without an id', () => {
    expect(basicUserSchemaOmitId.parse({ name: 'Alice', email: 'alice@example.com' })).toEqual({
      name: 'Alice',
      email: 'alice@example.com'
    });
  });
});

describe('adminSchema', () => {
  it('parses a valid admin row', () => {
    expect(adminSchema.parse({ id: 1, userId: 'u1' })).toEqual({ id: 1, userId: 'u1' });
  });

  it('rejects an empty userId', () => {
    expect(adminSchema.safeParse({ id: 1, userId: '' }).success).toBe(false);
  });
});

describe('partialAdminSchema', () => {
  it('parses without an id', () => {
    expect(partialAdminSchema.parse({ userId: 'u1' })).toEqual({ userId: 'u1' });
  });
});

describe('userSchema', () => {
  const validUser = {
    id: 'u1',
    name: 'Alice',
    email: 'alice@example.com',
    emailVerified: true,
    image: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z')
  };

  it('parses a valid user', () => {
    expect(userSchema.parse(validUser)).toEqual(validUser);
  });

  it('rejects a non-string id', () => {
    expect(userSchema.safeParse({ ...validUser, id: 1 }).success).toBe(false);
  });

  it('rejects a missing date', () => {
    const { createdAt, ...rest } = validUser;
    expect(userSchema.safeParse(rest).success).toBe(false);
  });
});

describe('orgSchema', () => {
  const validOrg = {
    id: 1,
    name: 'org1',
    description: 'a description',
    svgDataUrl: null,
    path: 'org1'
  };

  it('parses a valid org', () => {
    expect(orgSchema.parse(validOrg)).toEqual(validOrg);
  });

  it('rejects a blank path', () => {
    expect(orgSchema.safeParse({ ...validOrg, path: '  ' }).success).toBe(false);
  });

  it('allows a null svgDataUrl but not a blank one', () => {
    expect(orgSchema.safeParse({ ...validOrg, svgDataUrl: null }).success).toBe(true);
    expect(orgSchema.safeParse({ ...validOrg, svgDataUrl: ' ' }).success).toBe(false);
  });
});

describe('orgPositionsSchema', () => {
  it('parses a valid row', () => {
    expect(orgPositionsSchema.parse({ id: 1, userId: 'u1', positions: [0, 2] })).toEqual({
      id: 1,
      userId: 'u1',
      positions: [0, 2]
    });
  });

  it('rejects a negative position', () => {
    expect(orgPositionsSchema.safeParse({ id: 1, userId: 'u1', positions: [-1] }).success).toBe(false);
  });
});

describe('reservationStatusEnum', () => {
  it.each(['accepted', 'pending', 'canceled'])('accepts %s', (status) => {
    expect(reservationStatusEnum.safeParse(status).success).toBe(true);
  });

  it('rejects any other status', () => {
    expect(reservationStatusEnum.safeParse('lost').success).toBe(false);
  });
});

describe('reservationSchema', () => {
  const validReservation = {
    id: '1',
    orgId: 1,
    itemId: 1,
    status: 'accepted' as const,
    start: new Date('2026-01-01T00:00:00Z'),
    end: new Date('2026-01-01T02:00:00Z'),
    allDay: false,
    borrower: 'u1'
  };

  it('parses a valid reservation', () => {
    expect(reservationSchema.parse(validReservation)).toEqual(validReservation);
  });

  it('coerces string dates to Date', () => {
    const result = reservationSchema.parse({
      ...validReservation,
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-01T02:00:00Z'
    });

    expect(result.start).toEqual(new Date('2026-01-01T00:00:00Z'));
    expect(result.end).toEqual(new Date('2026-01-01T02:00:00Z'));
  });

  it('rejects when the end is before the start', () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      start: new Date('2026-01-01T02:00:00Z'),
      end: new Date('2026-01-01T00:00:00Z')
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('End date must be after start date');
    }
  });

  it('rejects when the end equals the start', () => {
    const result = reservationSchema.safeParse({ ...validReservation, end: validReservation.start });

    expect(result.success).toBe(false);
  });
});

describe('unrefinedReservationSchema', () => {
  it('accepts an end before the start (the refine lives on reservationSchema)', () => {
    const result = unrefinedReservationSchema.safeParse({
      id: '1',
      orgId: 1,
      itemId: 1,
      status: 'accepted',
      start: new Date('2026-01-01T02:00:00Z'),
      end: new Date('2026-01-01T00:00:00Z'),
      allDay: false,
      borrower: 'u1'
    });

    expect(result.success).toBe(true);
  });
});

describe('partialReservationSchema', () => {
  it('parses without id, status, or borrower', () => {
    const partial = {
      orgId: 1,
      itemId: 1,
      start: new Date('2026-01-01T00:00:00Z'),
      end: new Date('2026-01-01T02:00:00Z'),
      allDay: false
    };

    expect(partialReservationSchema.parse(partial)).toEqual(partial);
  });

  it('still requires the org and item ids', () => {
    expect(
      partialReservationSchema.safeParse({
        itemId: 1,
        start: new Date('2026-01-01T00:00:00Z'),
        end: new Date('2026-01-01T02:00:00Z'),
        allDay: false
      }).success
    ).toBe(false);
  });
});

describe('orgMemberSchema', () => {
  it('parses a valid member row', () => {
    expect(orgMemberSchema.parse({ id: 1, userId: 'u1', orgId: 5 })).toEqual({
      id: 1,
      userId: 'u1',
      orgId: 5
    });
  });

  it('rejects a missing orgId', () => {
    expect(orgMemberSchema.safeParse({ id: 1, userId: 'u1' }).success).toBe(false);
  });
});
