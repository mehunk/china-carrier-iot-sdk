export interface ClientOptions {
  username: string;
  password: string;
}

export interface Options {
  soap: ClientOptions;
  rest: ClientOptions;
}
