import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

import { Prisma } from "@prisma/client";
import { Response } from "express";

const errorMap: Record<string, { status: number; message: string } | undefined> = {
    P2000: { status: HttpStatus.BAD_REQUEST, message: "Invalid data provided" }, 
    P2002: { status: HttpStatus.CONFLICT, message: "Resource already exists" }, 
    P2025: { status: HttpStatus.NOT_FOUND, message: "Resource not found" }, 
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaErrorFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { code } = exception;
        const { status, message } = errorMap[code] ?? {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        };

        response.status(status).json({ statusCode: status, message });
    }
}