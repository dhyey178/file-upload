import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthenticatedUser } from '../../auth/auth.service';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req): Promise<string> {

    if (req.user && (req.user as AuthenticatedUser).id) {
      return Promise.resolve((req.user as AuthenticatedUser).id.toString());
    }

    return Promise.resolve(req.ip);
  }
}