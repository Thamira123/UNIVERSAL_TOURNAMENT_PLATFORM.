import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Neo4jService } from "../neo4j/neo4j.service";
import { inputObject, textField } from "../common/input";
import type { SessionUser } from "./current-user.decorator";

const scrypt = promisify(scryptCallback);
type UserRecord = SessionUser & { passwordHash: string };

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(private readonly neo4j: Neo4jService, config: ConfigService) {
    const secret = config.get<string>("JWT_SECRET");
    if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters.");
    this.jwtSecret = secret;
  }

  async signUp(value: unknown) {
    const body = inputObject(value);
    const name = textField(body, "name", 80);
    const email = textField(body, "email", 254).toLowerCase();
    const password = textField(body, "password", 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException("Enter a valid email address.");
    if (password.length < 8) throw new BadRequestException("Password must be at least 8 characters.");

    const salt = randomBytes(16);
    const derived = await scrypt(password, salt, 64) as Buffer;
    const user: UserRecord = { id: randomUUID(), name, email, passwordHash: `${salt.toString("hex")}:${derived.toString("hex")}` };
    try {
      await this.neo4j.run("CREATE (u:User {id:$id, name:$name, email:$email, passwordHash:$passwordHash, createdAt:datetime()})", { id: user.id, name: user.name, email: user.email, passwordHash: user.passwordHash }, "WRITE");
    } catch (error) {
      if (String((error as { code?: string }).code ?? "").includes("ConstraintValidationFailed")) throw new ConflictException("An account already exists for this email.");
      throw error;
    }
    return { accessToken: this.issueToken(user), user: this.publicUser(user) };
  }

  async signIn(value: unknown) {
    const body = inputObject(value);
    const email = textField(body, "email", 254).toLowerCase();
    const password = textField(body, "password", 200);
    const result = await this.neo4j.run("MATCH (u:User {email:$email}) RETURN u { .id, .name, .email, .passwordHash } AS user", { email });
    const stored = result.records[0]?.get("user") as UserRecord | undefined;
    if (!stored || !(await this.passwordMatches(password, stored.passwordHash))) throw new UnauthorizedException("Email or password is incorrect.");
    return { accessToken: this.issueToken(stored), user: this.publicUser(stored) };
  }

  async profile(userId: string) {
    const result = await this.neo4j.run(`
      MATCH (u:User {id:$userId})
      OPTIONAL MATCH (u)-[membership:ORG_MEMBER]->(o:Organization)
      WITH u, collect(CASE WHEN o IS NULL THEN null ELSE {id:o.id, name:o.name, role:membership.role} END) AS organizations
      RETURN u { .id, .name, .email, .createdAt } AS user, organizations
    `, { userId });
    const record = result.records[0];
    if (!record) throw new UnauthorizedException("Account no longer exists.");
    return { user: record.get("user"), organizations: record.get("organizations") };
  }

  async verifyAccessToken(token: string): Promise<SessionUser> {
    try {
      const [header, payload, signature] = token.split(".");
      if (!header || !payload || !signature) throw new Error("Malformed token");
      const expected = createHmac("sha256", this.jwtSecret).update(`${header}.${payload}`).digest();
      const actual = Buffer.from(signature, "base64url");
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Invalid token");
      const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub: string; exp: number };
      if (!claims.sub || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error("Expired token");
      const result = await this.neo4j.run("MATCH (u:User {id:$id}) RETURN u { .id, .name, .email } AS user", { id: claims.sub });
      const user = result.records[0]?.get("user") as SessionUser | undefined;
      if (!user) throw new Error("User not found");
      return user;
    } catch {
      throw new UnauthorizedException("Your session is invalid or expired. Sign in again.");
    }
  }

  private async passwordMatches(password: string, saved: string): Promise<boolean> {
    const [saltHex, hashHex] = saved.split(":");
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private issueToken(user: SessionUser): string {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const header = encode({ alg: "HS256", typ: "JWT" });
    const payload = encode({ sub: user.id, email: user.email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 });
    const signature = createHmac("sha256", this.jwtSecret).update(`${header}.${payload}`).digest("base64url");
    return `${header}.${payload}.${signature}`;
  }

  private publicUser(user: SessionUser) {
    return { id: user.id, name: user.name, email: user.email };
  }
}

