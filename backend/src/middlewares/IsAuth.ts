import { Request, Response, NextFunction } from 'express';

export default async function IsAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user != null) {
        next();
    } else {
        res.status(401).json({
            errors: [
                "Login é necessário para acessar o conteúdo desta página!"
            ]
        });
    }
}