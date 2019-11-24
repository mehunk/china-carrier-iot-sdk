export interface ClientOptions {
  username: string;
  password: string;
  rootEndpoint?: string;
}

export interface Options {
  soap: ClientOptions;
  rest: ClientOptions;
}
