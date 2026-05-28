import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

/**
 * Guard yang memverifikasi Firebase ID Token dari header Authorization.
 * Token dikirim sebagai "Bearer <idToken>" dari client.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(idToken);
      
      // Attach user info to request object
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        role: decodedToken.role || 'member',
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
