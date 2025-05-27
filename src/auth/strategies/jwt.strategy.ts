import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as process from 'process';
import { AuthenticatedUser } from '../auth.service';

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    const { password, ...result } = user;
    return result as AuthenticatedUser;
  }
}
