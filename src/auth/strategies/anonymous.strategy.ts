import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-anonymous';

// passport-anonymous never calls validate() — it always passes the request through.
// The validate() stub here satisfies TypeScript's abstract class requirement only.
@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy, 'anonymous') {
  validate(): any {
    return {};
  }
}
