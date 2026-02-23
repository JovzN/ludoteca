import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'Ludoteca',
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

pool.on('connect', () => {
    console.log('🐘 Conectado a PostgreSQL (Ludoteca)');
});