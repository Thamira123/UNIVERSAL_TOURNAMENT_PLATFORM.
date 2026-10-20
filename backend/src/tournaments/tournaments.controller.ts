import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser, type SessionUser } from "../auth/current-user.decorator";
import { EventsService } from "./events.service";
import { TournamentsService } from "./tournaments.service";

@UseGuards(AuthGuard)
@Controller("tournaments")
export class TournamentsController {
  constructor(private readonly tournaments: TournamentsService, private readonly events: EventsService) {}

  @Get(":id") getOne(@Param("id") id: string, @CurrentUser() user: SessionUser) { return this.tournaments.getOne(id, user.id); }
  @Post(":id/admins") addAdmin(@Param("id") id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) { return this.tournaments.addAdmin(id, body, user.id); }
  @Post(":id/events") createEvent(@Param("id") id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) { return this.events.create(id, body, user.id); }
}

