import { Request, Response, NextFunction } from 'express';

export default async function IsAuth(req: Request, res: Response, next: NextFunction) {
    const NODE_ENV = process.env.NODE_ENV;

    if (NODE_ENV != 'development') {
        if (!req.session.user) {
            return res.status(401).json({
                errors: [
                    "É necessário estar autenticado para acessar o conteúdo desta página."
                ]
            });  
        } else if (!req.session.user.isAdmin) {
            res.status(403).json({
                errors: [
                    "É necessário ser administrador para acessar o conteúdo desta página."
                ]
            });
        }
    }

    next();
}