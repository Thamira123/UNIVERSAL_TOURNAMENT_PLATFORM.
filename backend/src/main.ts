import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableShutdownHooks();
  app.enableCors({ origin: config.get<string>("FRONTEND_URL", "http://localhost:3000") });
  app.setGlobalPrefix("api");
  const port = config.get<number>("PORT", 4000);
  await app.listen(port);
  console.log(`Tournament API listening on http://localhost:${port}/api`);
}

void bootstrap();


