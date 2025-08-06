import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('AuthGuard activated');

    const req: Request = context.switchToHttp().getRequest();

    const token = req.headers.authorization?.split(' ')?.[1];
    console.log('Token received:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('No token provided');
      throw new UnauthorizedException('Token not provided');
    }

    try {
      let data = this.jwt.verify(token, { secret: 'accessSecret' });
      req['user'] = {
        id: data['id'],
        role: data['role'],
      };
      console.log('User authenticated:', req['user']);
    } catch (error) {
      console.log('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
