import { Request } from "express";

export const extractTokenFromCookies = (propName: string) => (req: Request): string | null => {
    let token = null

    if (req && req.cookies) {
      token = req.cookies[propName]
    }

    return token
}