import { Item, Org } from '../types/types';
import { HTTPStatusCode } from '@ts-rest/core';

export function hoursBetween(dateStart: Date, dateEnd: Date) {
  return (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60);
}

export function tsrErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

export function groupItems(info: { org: Org; items: Item[] }[]): Record<number, Item[]>;
export function groupItems(info: { orgId: number; items: Item[] }[]): Record<number, Item[]>;
export function groupItems(
  info: ({ org: Org; items: Item[] } | { orgId: number; items: Item[] })[]
): Record<number, Item[]> {
  return info.reduce(
    (acc, curr) => {
      const orgId = 'orgId' in curr ? curr.orgId : curr.org.id;
      acc[orgId] = curr.items;
      return acc;
    },
    {} as Record<number, Item[]>
  );
}

export function extractBodyOrDefault<T>(
  response: { status: 200; body: T } | { status: Exclude<HTTPStatusCode, 200>; body: unknown },
  defaultValue: T
): T {
  if (response.status === 200) {
    return response.body;
  }

  return defaultValue;
}
