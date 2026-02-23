import { Request, Response, NextFunction } from 'express';

// Definimos qué debe tener un usuario para pasar la seguridad
export const esAdmin = (req: Request, res: Response, next: NextFunction) => {
    const rolUsuario = req.headers['x-role']; 

    if (rolUsuario === '1') { 
        next(); 
    } else {
        res.status(403).json({ 
            success: false, 
            message: "Acceso denegado: Se requieren permisos de administrador" 
        });
    }
};