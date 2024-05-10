const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');


const app = express();
const PORT2 = process.env.PORT2;
app.use(express.json());
app.use(cors());



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Usuario3 (
        nombre_usuario VARCHAR(255) NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        nombre VARCHAR(255),
        apellido VARCHAR(255),
        estado VARCHAR(255),
        rol VARCHAR(255)
      )
    `);
  } catch (err) {
    console.error('Error creando la tabla', err);
  } finally {
    client.release();
  }
})();

app.post('/registro_usuario', async (req, res) => {
  try {
      const { user, password, nombre, apellido } = req.body;
      const client = await pool.connect();
      const query = 'INSERT INTO Usuario3 (nombre_usuario, contraseña, nombre, apellido) VALUES ($1, $2, $3, $4)';
      await client.query(query, [user, password, nombre, apellido]);
      
      // Liberar el cliente de la pool
      client.release();
   // Enviar una respuesta de éxito al cliente
      res.json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      // Enviar una respuesta de error al cliente
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  });

  app.post('/registro_rol2', async (req, res) => {
    try {
        const { user, rol } = req.body;
        const client = await pool.connect();
       await pool.query('UPDATE Usuario3 SET rol = $1 WHERE nombre_usuario = $2', [rol, user]);
    
        
        // Liberar el cliente de la pool
        client.release();
     // Enviar una respuesta de éxito al cliente
        res.json({ message: 'Rol cargado correctamente' });
      } catch (error) {
        console.error('Error al registrar el rol:', error);
        // Enviar una respuesta de error al cliente
        res.status(500).json({ error: 'Error al registrar el rol' });
      }
    });

    app.get('/usuarios', async (req, res) => {
      try {
          const client = await pool.connect();
          const result = await client.query('SELECT * FROM Usuario3');
          const usuarios = result.rows;
          
          // Liberar el cliente de la pool
          client.release();
          
          res.json({ usuarios });
      } catch (error) {
          console.error('Error al obtener usuarios:', error);
          res.status(500).json({ error: 'Error al obtener usuarios' });
      }
  });
    
  app.get('/usuarioyestado', async (req, res) => {
    try {
      const client = await pool.connect();
      const query = 'SELECT nombre_usuario, estado FROM Usuario3';
      const result = await client.query(query);
      // Liberar el cliente de la pool
      client.release();
      // Enviar los datos al cliente
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener usuarios y estados:', error);
      res.status(500).json({ error: 'Error al obtener usuarios y estados' });
    }
  });
  

 
  
  app.listen(PORT2, () => {
    console.log(`Servidor escuchando en el puerto ${PORT2}`);
  });