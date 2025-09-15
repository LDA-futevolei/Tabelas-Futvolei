import bcrypt, { genSaltSync } from 'bcrypt';

const SALT_ROUNDS = 10;

class User {
    static IsPasswordMatch(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }

    static HashPassword(password: string): string {
        const salt = genSaltSync(SALT_ROUNDS);
        return bcrypt.hashSync(password, salt);
    }
}

export default User;
