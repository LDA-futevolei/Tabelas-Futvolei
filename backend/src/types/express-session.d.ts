import 'express-session';
import { UserProfile } from '../src/user';

declare module 'express-session' {
  interface SessionData {
    user?: UserProfile;
  }
}