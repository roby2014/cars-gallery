type User = {
  id: number
  email: string
}

declare namespace Express {
  export interface Request {
    user?: User | object
  }
}

declare module "*.json" {
  const value: any
  export default value
}
