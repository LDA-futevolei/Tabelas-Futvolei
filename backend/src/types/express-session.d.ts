import '@/types/express-session';
import { UserProfile } from '../src/user';
import User from '@/models/user';

declare module 'express-session' {
	interface SessionData {
    user?: UserProfile;
	}
}