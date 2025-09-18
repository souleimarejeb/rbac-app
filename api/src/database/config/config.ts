import { DataSource, DataSourceOptions } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";

// ENTITIES

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: "mysql",
  host: configService.get("DB_HOST"),
  port: parseInt(configService.get("DB_PORT")|| "3306", 10) ,
  username: configService.get("DB_USERNAME"),
  password: configService.get("DB_PASSWORD"),
  database: configService.get("DB_NAME"),
  entities: [
// entites go here
  ],
  migrations: ["dist/database/migrations/*.js"],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
