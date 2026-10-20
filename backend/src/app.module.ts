import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { Neo4jModule } from "./neo4j/neo4j.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { TournamentsModule } from "./tournaments/tournaments.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../.env", ".env"] }), Neo4jModule, AuthModule, OrganizationsModule, TournamentsModule, HealthModule],
})
export class AppModule {}
