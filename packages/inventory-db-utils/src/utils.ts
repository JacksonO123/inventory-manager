export function getConnectionUrl(
  username: string,
  password: string,
  host: string,
  port: number,
  dbName: string
) {
  return `postgresql://${username}:${password}@${host}:${port}/${dbName}`;
}
