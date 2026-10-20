import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { CurrentUser, type SessionUser } from "./current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup") signUp(@Body() body: unknown) { return this.auth.signUp(body); }
  @Post("login") signIn(@Body() body: unknown) { return this.auth.signIn(body); }

  @Get("me") @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: SessionUser) { return this.auth.profile(user.id); }
}
