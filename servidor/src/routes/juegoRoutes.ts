import { Router } from 'express';
import { getJuegos, crearJuego } from '../controllers/juegoController.js';
import { esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * 1. BÚSQUEDA Y CONSULTA GENERAL
 * Endpoint: GET /api/juegos
 * Permite filtrar por ?search=, ?categoria=, etc.
 */
router.get('/', getJuegos);

/**
 * 2. REGISTRO DE NUEVOS JUEGOS
 * Endpoint: POST /api/juegos
 * Este es el que protegeremos con seguridad en el siguiente paso
 */
router.post('/', esAdmin, crearJuego);

export default router;