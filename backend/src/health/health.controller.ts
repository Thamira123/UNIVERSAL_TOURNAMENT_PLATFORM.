import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";

@Controller("health")
export class HealthController {
  constructor(private readonly neo4j: Neo4jService) {}

  @Get()
  getHealth() {
    return { status: "ok", service: "tournament-api" };
  }

  @Get("neo4j")
  async getNeo4jHealth() {
    try {
      await this.neo4j.verifyConnectivity();
      return { status: "ok", database: "neo4j" };
    } catch {
      throw new ServiceUnavailableException({ status: "error", database: "neo4j" });
    }
  }
}
