export type DbConfig = {
    user: string
    password: string
    database: string
    host: string
    port: number
}

export type JwtOptions = {
    expire: string,
    secret: string
}

export type JwtConfig = {
    access: JwtOptions
    refresh: JwtOptions
    confirm: JwtOptions
}

export type MailConfig = {
    host: string,
    user: string,
    password: string,
    port: number
}

export type CommonType = {
    host: string
}

export default () => ({
    common: {
        host: process.env.HOST_NAME
    },
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
        },
        confirm: {
            expire: process.env.JWT_EMAIL_CONFIRM_EXPIRE,
            secret: process.env.JWT_EMAIL_CONFIRM_SECRET
        }
    },
    mail: {
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        port: parseInt(process.env.MAIL_PORT)
    }
})