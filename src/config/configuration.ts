import { access } from "fs"

export type DbConfig = {
    user: string
    password: string
    database: string
    host: string
    port: number
}

export type Jwt = {
    access: {
        expire: string,
        secret: string
    },
    refresh: {
        expire: string,
        secret: string
    }
}

export default () => ({
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
    },
    passport: {
        access: {
            expire: process.env.JWT_ACCESS_EXPIRE,
            secret: process.env.JWT_ACCESS_SECRET
        },
        refresh: {
            expire: process.env.JWT_REFRESH_EXPIRE,
            secret: process.env.JWT_REFRESH_SECRET
        }
    }
})