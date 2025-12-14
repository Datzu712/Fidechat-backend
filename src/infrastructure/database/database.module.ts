import { Global, Module } from '@nestjs/common';
import { DATABASE_CONNECTION, OracleProvider } from './oracle/oracle.provider';
@Global()
@Module({
    providers: [OracleProvider],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
