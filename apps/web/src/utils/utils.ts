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
