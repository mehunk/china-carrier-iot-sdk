export interface Options {
  username: string;
  password: string;
  rootEndpoint?: string;
}

export interface CustomOptions {
  maxTimeoutMs?: number;
  log?: (obj: object) => Promise<void>;
}
