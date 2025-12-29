import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) return false;
    const parts = auth.split(' ');
    if (parts.length !== 2) return false;
    const token = parts[1];
    try {
      const payload = this.jwt.verify(token);
      req.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
}
