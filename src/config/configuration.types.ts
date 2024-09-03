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
    passwordChange: JwtOptions
}

export type MailConfig = {
    host: string,
    user: string,
    password: string,
    port: number
}

export type CloudinaryConfig = {
    apiKey: string
    apiSecret: string
    cloudName: string
    folder: string
}

export type CommonConfig = {
    host: string
}