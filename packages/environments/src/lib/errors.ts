export class EnvParseError extends Error {
  constructor() {
    super('[ERROR] (ENV parser): failed to parse .env file contents');
  }
}

export class EnvClientServerSecretAccessError extends Error {
  constructor() {
    super('[ERROR] (ENV access): server secret accessed on client');
  }
}
