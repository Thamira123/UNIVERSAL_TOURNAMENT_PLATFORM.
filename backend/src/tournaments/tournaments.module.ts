import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EventsController, SportsController } from "./events.controller";
import { EventsService } from "./events.service";
import { TournamentsController } from "./tournaments.controller";
import { TournamentsService } from "./tournaments.service";

@Module({ imports: [AuthModule], controllers: [TournamentsController, EventsController, SportsController], providers: [TournamentsService, EventsService] })
export class TournamentsModule {}
