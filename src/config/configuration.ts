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
        },
        passwordChange: {
            expire: process.env.JWT_PASSWORD_CHANGE_EXPIRE,
            secret: process.env.JWT_PASSWORD_CHANGE_SECRET
        }
    },
    mail: {
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        port: parseInt(process.env.MAIL_PORT)
    },
    cloudinary: {
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder: process.env.CLOUDINARY_FOLDER_NAME,
    }
})