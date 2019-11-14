export interface Options {
  appId: string;
  password: string;
  rootEndpoint?: string;
}

export interface AccessTokenObj {
  token: string;
  expireTime: number;
}
