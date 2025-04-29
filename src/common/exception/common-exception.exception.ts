import { HttpException, HttpStatus } from "@nestjs/common";

export class CommonException extends HttpException {
    constructor(
        message: string,
        status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    ) {
        super(message, status)
    }
}