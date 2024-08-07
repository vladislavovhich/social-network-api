import { ConfigService } from "@nestjs/config";
import { DbConfig } from "src/config/configuration";
import { UserEntity } from "src/user/entities/user.entity";
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

            console.log('Database connected successfully');

            return dataSource;
        } catch (error) {
            console.log('Error connecting to database');

            throw error;
        }
    },
}