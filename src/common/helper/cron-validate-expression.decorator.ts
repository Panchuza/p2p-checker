import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "@nestjs/class-validator";
import * as cron from 'node-cron'

@ValidatorConstraint({name: 'IsValidCronExpression', async: false})
export class IsValidCronExpression implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments){
        if(!cron.validate(text)){
            return false
        }
        return true
    }
    defaultMessage(args: ValidationArguments) {
        const text = args.value
        if(!cron.validate(text)) {
            return 'Error en el formato de la expresión de cron';
        }
    }
}