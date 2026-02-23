// servidor/src/controllers/juegos.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/db.js';

/**
 * 1. CONSULTAR INVENTARIO (Con Búsqueda y Filtros)*/
export const getJuegos = async (req: Request, res: Response) => {
  try {
    const { search, categoria, complejidad, edad } = req.query;
    
    // Consulta base con JOIN para traer el nombre legible de la categoría
    let query = `
      SELECT j.*, c.nombre_categoria 
      FROM juegos j 
      LEFT JOIN categorias c ON j.id_categoria = c.id_categoria
      WHERE 1=1
    `;
    const params: any[] = [];

    // Búsqueda por texto (Título o Etiquetas)
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (j.titulo ILIKE $${params.length} OR $${params.length} = ANY(j.tags))`;
    }

    if (categoria) {
      params.push(categoria);
      query += ` AND c.nombre_categoria = $${params.length}`;
    }

    if (complejidad) {
      params.push(complejidad);
      query += ` AND j.complejidad = $${params.length}`;
    }

    if (edad) {
      params.push(Number(edad));
      query += ` AND j.edad_recomendada <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al consultar inventario:", error);
    res.status(500).json({ message: "Error interno al obtener juegos" });
  }
};

/**
 * 2. REGISTRAR JUEGO*/
export const crearJuego = async (req: Request, res: Response) => {
  const { titulo, id_categoria, descripcion, jugadores_min, jugadores_max, edad_recomendada, duracion_minutos, complejidad, tags, imagen_url } = req.body;

  try {
    const query = `
      INSERT INTO juegos (
        titulo, id_categoria, descripcion, jugadores_min, jugadores_max, 
        edad_recomendada, duracion_minutos, complejidad, tags, imagen_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      titulo, id_categoria, descripcion, jugadores_min, jugadores_max, 
      edad_recomendada, duracion_minutos, complejidad, tags, imagen_url
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ 
      message: "Juego registrado exitosamente", 
      juego: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al registrar juego:", error);
    res.status(500).json({ message: "Error al guardar el juego en el inventario" });
  }
};