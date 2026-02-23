import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './config/db'; 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- 1. RUTAS DE CATEGORÍAS ---

app.get('/api/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre_categoria ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error de base de datos" });
    }
});

app.post('/api/categorias', async (req, res) => {
    const { nombre_categoria } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categorias (nombre_categoria) VALUES ($1) RETURNING *',
            [nombre_categoria]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear categoría:", error);
        res.status(500).json({ error: "Error de base de datos" });
    }
});

// --- 2. RUTA MAESTRA: REGISTRAR JUEGO E INVENTARIO ---

app.post('/api/juegos/completo', async (req, res) => {
    const { 
        titulo, id_categoria, descripcion, jugadores_min, 
        jugadores_max, edad_recomendada, duracion_minutos, 
        complejidad, tags, sku, cantidad 
    } = req.body;

    try {
        await pool.query('BEGIN');

        // 1. Insertar el juego en la tabla maestra
        const juegoRes = await pool.query(
            `INSERT INTO juegos (
                titulo, id_categoria, descripcion, jugadores_min, 
                jugadores_max, edad_recomendada, duracion_minutos, 
                complejidad, tags, cantidad
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_juego`,
            [titulo, id_categoria, descripcion, jugadores_min, jugadores_max, edad_recomendada, duracion_minutos, complejidad, tags, cantidad]
        );
        
        const id_juego = juegoRes.rows[0].id_juego;

        // 2. Crear tantos ejemplares como diga la 'cantidad'
        const numCantidad = parseInt(cantidad) || 0;
        
        for (let i = 1; i <= numCantidad; i++) {
            const skuIndividual = `${sku}-${i}`; 
            await pool.query(
                `INSERT INTO ejemplares (id_juego, sku, disponible) VALUES ($1, $2, TRUE)`,
                [id_juego, skuIndividual]
            );
        }

        await pool.query('COMMIT');
        res.json({ success: true, message: `Juego registrado con ${numCantidad} ejemplares físicos.` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, error: "Error al guardar juego y ejemplares" });
    }
});

// --- 3. RUTA DE LOGIN ---

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Usuario no encontrado" });
        }

        const usuario = result.rows[0];

        const hashLimpio = usuario.password_hash.trim();

        const match = await bcrypt.compare(password, hashLimpio);

        if (match) {
        res.json({ 
            success: true, 
            user: { 
                id_usuario: usuario.id_usuario, 
                username: usuario.username, 
                id_rol: usuario.id_rol 
            } 
        });
        } else {
            console.log("❌ La contraseña no coincide con el hash almacenado.");
            res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }
    } catch (err) {
        res.status(500).json({ error: "Error de servidor" });
    }
});

// --- RUTA: REGISTRAR NUEVO USUARIO ---
app.post('/api/usuarios/registro', async (req, res) => {
    // El id_rol viene desde el formulario del modal
    const { username, email, password, id_rol } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO usuarios (username, email, password_hash, id_rol) VALUES ($1, $2, $3, $4)',
            [
                username, 
                email, 
                hash, 
                id_rol // <--- Aquí se guarda el '1' o '2' que elegiste en el Modal
            ]
        );

        res.json({ success: true, message: "Usuario creado exitosamente" });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
});

// --- 4. OBTENER INVENTARIO (CON FILTRO DE ACTIVO) ---

app.get('/api/juegos', async (req, res) => {
    const { search, complejidad, soloDisponibles } = req.query;
    console.log("🔍 Filtros:", { search, complejidad, soloDisponibles });

    try {
        let query = `
            SELECT j.*, c.nombre_categoria 
            FROM juegos j 
            LEFT JOIN categorias c ON j.id_categoria = c.id_categoria
            WHERE j.activo = true  -- <--- Filtro de auditoría
        `;
        let params: any[] = [];
        let pCount = 1;

        if (search && search !== 'undefined' && search !== '') {
            query += ` AND (j.titulo ILIKE $${pCount} OR j.tags::text ILIKE $${pCount} OR CAST(j.cantidad AS TEXT) = $${pCount + 1} OR CAST(j.edad_recomendada AS TEXT) = $${pCount + 1})`;
            params.push(`%${search}%`);
            params.push(search);
            pCount += 2;
        }

        if (complejidad && complejidad !== 'Todas' && complejidad !== 'undefined') {
            query += ` AND j.complejidad = $${pCount}`;
            params.push(complejidad);
            pCount++;
        }

        if (soloDisponibles === 'true') {
            query += ` AND j.cantidad > 0`;
        }

        query += ` ORDER BY j.fecha_creacion DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error en servidor:", error);
        res.status(500).json({ error: "Error de servidor" });
    }
});

// --- 5. EDITAR JUEGOS ---

app.put('/api/juegos/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        titulo, id_categoria, descripcion, jugadores_min, 
        jugadores_max, edad_recomendada, duracion_minutos, 
        complejidad, tags, cantidad 
    } = req.body;

    try {
        await pool.query(
            `UPDATE juegos SET 
                titulo = $1, id_categoria = $2, descripcion = $3, 
                jugadores_min = $4, jugadores_max = $5, edad_recomendada = $6, 
                duracion_minutos = $7, complejidad = $8, tags = $9, cantidad = $10
             WHERE id_juego = $11`,
            [titulo, id_categoria, descripcion, jugadores_min, jugadores_max, edad_recomendada, duracion_minutos, complejidad, tags, cantidad, id]
        );
        res.json({ success: true, message: "Juego actualizado correctamente" });
    } catch (error) {
        console.error("Error al editar:", error);
        res.status(500).json({ error: "Error al actualizar en la base de datos" });
    }
});

// --- 6. ELIMINAR JUEGO (SOFT DELETE) ---

app.delete('/api/juegos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE juegos SET activo = false WHERE id_juego = $1', [id]);
        res.json({ success: true, message: "Juego archivado correctamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ error: "Error al archivar el registro" });
    }
});

app.post('/api/prestamos', async (req, res) => {
    const { id_juego, id_usuario, dias_prestamo } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ success: false, error: "Debe seleccionar un usuario (ej. Oscar)." });
    }

    try {
        await pool.query('BEGIN');

        // 1. Buscar el primer ejemplar disponible de ese juego
        const ejemplarRes = await pool.query(
            'SELECT id_ejemplar FROM ejemplares WHERE id_juego = $1 AND estado = $2 LIMIT 1',
            [id_juego, 'Disponible']
        );
        
        if (ejemplarRes.rows.length === 0) {
            return res.status(400).json({ error: "No hay ejemplares físicos disponibles." });
        }

        const id_ejemplar = ejemplarRes.rows[0].id_ejemplar;

        // 2. Crear el registro de préstamo
        await pool.query(
            `INSERT INTO prestamos (id_usuario, id_ejemplar, fecha_devolucion_pactada) 
             VALUES ($1, $2, CURRENT_DATE + ($3 || ' days')::interval)`,
            [id_usuario, id_ejemplar, dias_prestamo || 7]
        );

        // 3. Marcar el ejemplar como NO disponible
        await pool.query(
            'UPDATE ejemplares SET disponible = FALSE WHERE id_ejemplar = $1',
            [id_ejemplar]
        );

        // 4. Restar 1 al stock visual en la tabla juegos
        await pool.query(
            'UPDATE juegos SET cantidad = cantidad - 1 WHERE id_juego = $1',
            [id_juego]
        );

        await pool.query('COMMIT');
        res.json({ success: true, message: "¡Préstamo registrado con éxito!" });

    } catch (error: any) {
        await pool.query('ROLLBACK');
        console.error("❌ Error en préstamo:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/usuarios/buscar', async (req, res) => {
    const { q } = req.query;
    try {
        const result = await pool.query(
            `SELECT id_usuario, username, email FROM usuarios 
             WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 5`, 
            [`%${q}%`]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar usuarios" });
    }
});

app.get('/api/admin/prestamos-activos', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.username, 
                u.email, 
                j.titulo as juego, 
                p.fecha_salida, -- Cambiado de fecha_prestamo a fecha_salida
                p.fecha_devolucion_pactada,
                p.id_prestamo,
                p.estado_prestamo -- Usamos tu columna de estado
            FROM prestamos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            JOIN ejemplares e ON p.id_ejemplar = e.id_ejemplar
            JOIN juegos j ON e.id_juego = j.id_juego
            WHERE p.estado_prestamo = 'En curso' -- Filtramos por tu estado por defecto
            ORDER BY p.fecha_devolucion_pactada ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error: any) {
        console.error("❌ Error en SQL:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/prestamos/:id/devolver', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('BEGIN');

        // 1. Buscamos el ejemplar y el juego asociados a este préstamo
        const infoRes = await pool.query(
            `SELECT p.id_ejemplar, e.id_juego 
             FROM prestamos p 
             JOIN ejemplares e ON p.id_ejemplar = e.id_ejemplar 
             WHERE p.id_prestamo = $1`, [id]
        );

        if (infoRes.rows.length === 0) {
            throw new Error("No se encontró el registro del préstamo.");
        }

        const { id_ejemplar, id_juego } = infoRes.rows[0];

        // 2. Cerramos el préstamo: Estado 'Finalizado' y grabamos la fecha de hoy
        await pool.query(
            `UPDATE prestamos 
             SET estado_prestamo = 'Finalizado', 
                 fecha_devolucion_real = CURRENT_TIMESTAMP 
             WHERE id_prestamo = $1`, [id]
        );

        // 3. El ejemplar físico vuelve a estar 'disponible'
        await pool.query(
            'UPDATE ejemplares SET disponible = TRUE WHERE id_ejemplar = $1', 
            [id_ejemplar]
        );

        // 4. Aumentamos +1 el stock visual en el catálogo de juegos
        await pool.query(
            'UPDATE juegos SET cantidad = cantidad + 1 WHERE id_juego = $1', 
            [id_juego]
        );

        await pool.query('COMMIT');
        res.json({ success: true, message: "¡Juego recibido y stock actualizado!" });

    } catch (error: any) {
        await pool.query('ROLLBACK');
        console.error("Error al devolver:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/historial-prestamos', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.username, 
                j.titulo as juego, 
                p.fecha_salida, 
                p.fecha_devolucion_pactada,
                p.fecha_devolucion_real,
                p.id_prestamo -- Importante para el 'key' de React
            FROM prestamos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            JOIN ejemplares e ON p.id_ejemplar = e.id_ejemplar
            JOIN juegos j ON e.id_juego = j.id_juego
            WHERE p.estado_prestamo = 'Finalizado'
            ORDER BY p.fecha_devolucion_real DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error: any) {
        console.error("❌ Error en historial:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mis-prestamos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    app.get('/api/mis-prestamos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    
    // ESTO ES VITAL: Mira tu terminal de Node cuando cargues la página
    console.log("-----------------------------------------");
    console.log(`🔍 Intentando cargar datos para el Usuario ID: [${id_usuario}]`);

    try {
        const query = `
            SELECT 
                j.titulo as juego, 
                p.fecha_salida, 
                p.fecha_devolucion_pactada,
                p.fecha_devolucion_real,
                p.estado_prestamo
            FROM prestamos p
            JOIN ejemplares e ON p.id_ejemplar = e.id_ejemplar
            JOIN juegos j ON e.id_juego = j.id_juego
            WHERE p.id_usuario = $1
            ORDER BY p.fecha_salida DESC;
        `;
        
        const result = await pool.query(query, [id_usuario]);
        
        console.log(`✅ Resultado: Se encontraron ${result.rows.length} registros.`);
        console.log("-----------------------------------------");

        res.json(result.rows);
    } catch (error: any) {
        console.error("❌ ERROR CRÍTICO EN SQL:", error.message);
        res.status(500).json({ error: error.message });
    }
});
    try {
        const query = `
            SELECT 
                j.titulo as juego, 
                p.fecha_salida, 
                p.fecha_devolucion_pactada,
                p.fecha_devolucion_real,
                p.estado_prestamo
            FROM prestamos p
            JOIN ejemplares e ON p.id_ejemplar = e.id_ejemplar
            JOIN juegos j ON e.id_juego = j.id_juego
            WHERE p.id_usuario = $1  -- <--- Trae TODO lo de este alumno
            ORDER BY 
                CASE WHEN p.estado_prestamo = 'En curso' THEN 1 ELSE 2 END, -- Los que tiene en mano primero
                p.fecha_salida DESC;
        `;
        const result = await pool.query(query, [id_usuario]);
        res.json(result.rows);
    } catch (error: any) {
        console.error("❌ Error en mis-prestamos:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- CONFIGURACIÓN ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Ludoteca listo en http://localhost:${PORT}`);
    
});