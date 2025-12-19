import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.validatePassword(email, pass);
    if (!user) return null;
    return user;
  }

  async login(email: string, user: any) {
    const payload = { sub: user.id, email };
    const token = this.jwt.sign(payload);
    // create session
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });
    return { accessToken: token, sessionId: session.id };
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('invalid credentials');
    return this.login(email, user);
  }
}
