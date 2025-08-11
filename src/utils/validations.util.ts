import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
/**
 * @deprecated Use class-validator or zod for validations instead.
 */
export class ValidationService {
    public validateString<U>(input: U) {
        if (typeof input !== 'string') {
            throw new BadRequestException('Input must be a string');
        }

        if (!input.trim()) {
            throw new BadRequestException('Input cannot be empty');
        }

        return input;
    }
}
