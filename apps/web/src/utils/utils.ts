export function hoursBetween(dateStart: Date, dateEnd: Date) {
  return (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60);
}
