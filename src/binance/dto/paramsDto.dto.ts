import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "@nestjs/class-validator"
import { IsValidCronExpression } from "src/common/helper/cron-validate-expression.decorator"

export class ParamsDto {

    @IsString()
    @IsNotEmpty()
    fiat: string

    @IsString()
    @IsNotEmpty()
    tradeType: string

    @IsString()
    @IsNotEmpty()
    asset: string

    @IsString()
    @IsNotEmpty()
    publisherType: string

    @IsOptional()
    payTypes: string[] = []

    @IsNumber()
    @IsNotEmpty()
    additionalKycVerifyFilter: number

    @Validate(IsValidCronExpression)
    cronExpression: string
}