const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT3 = process.env.PORT3;
app.use(express.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.post('/estado', async (req, res) => {
    try {
        const { user, estado } = req.body;
        const client = await pool.connect();
       await pool.query('UPDATE Usuario3 SET estado = $1 WHERE nombre_usuario = $2', [estado, user]);
    
        
        // Liberar el cliente de la pool
        client.release();
     // Enviar una respuesta de éxito al cliente
        res.json({ message: 'Estado cambiado correctamente' });
      } catch (error) {
        console.error('Error al cambiar el estado:', error);
        // Enviar una respuesta de error al cliente
        res.status(500).json({ error: 'Error al cambiar el estado' });
      }
    });

    
  app.listen(PORT3, () => {
    console.log(`Servidor escuchando en el puerto ${PORT3}`);
  });
    