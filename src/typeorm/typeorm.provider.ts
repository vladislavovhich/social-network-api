import { ConfigService } from "@nestjs/config";
import { DbConfig } from "src/config/configuration.types";
import { DataSource } from "typeorm";

export const provider = {
    provide: DataSource, 
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        try {
            const dbConfig = configService.get<DbConfig>("db")
            
            const dataSource = new DataSource({
                type: 'postgres',
                host: dbConfig.host,
                port: dbConfig.port,
                username: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
                synchronize: true,
                entities: [`${__dirname}/../**/**.entity{.ts,.js}`], 
            });

            await dataSource.initialize(); 

            return dataSource;
        } catch (error) {
            throw error;
        }
    },
}