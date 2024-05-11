const express = require('express');
const axios = require('axios');
require('dotenv').config();
const bodyParser = require('body-parser');
const { Pool } = require('pg');



const app = express();
const PORT = process.env.PORT;
const cors = require('cors');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar el token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
};

//Genera Token
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

  app.post('/login', async (req, res) => {
    try {
      let estado1 = 'deshabilitado'
      const { username, password } = req.body;
      console.log('Datos recibidos:', req.body);
      
      const client = await pool.connect();
      const query = 'SELECT * FROM Usuario3 WHERE nombre_usuario = $1 ';
      const result = await client.query(query, [username]);
      const usuario = result.rows[0];
      

      // Comparar la contraseña almacenada en la base de datos con la proporcionada
      if (usuario.contraseña !== password) {
        client.release();
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      console.log(usuario);

      if (usuario.estado !== estado1) {
       
      // Generar y enviar el token
        const token = generateToken(usuario); // Suponiendo que tienes una función para generar el token
        client.release();
        res.status(200).json({ message: 'Login exitoso', token });
  
    }  else {
        res.status(200).json({ message: 'El usuario esta inhabilitado'});

      }
    } catch (error) {
      console.error('Usuario incorrecto:', error);
      res.status(500).json({ error: 'Usuario incorrecto' });
    }
  });



app.post('/registro',  async (req, res) => {
    try {
      const { user, password, nombre, apellido } = req.body;
  
      // Enviar los datos al microservicio
      const response = await axios.post('http://localhost:6001/registro_usuario', {
        user,
        password,
        nombre,
        apellido
      });
  
      // Manejar la respuesta del microservicio
      const registro = response.data;
      res.json({ registro });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al realizar el registro' });
    }
  });

  app.post('/registro_rol', verifyToken, async (req, res) => {
    try{
    const { user, rol } = req.body;
    const response = await axios.post('http://localhost:6001/registro_rol2', {
      user,
      rol
    });

    const registro = response.data
    res.json({ registro });
    } catch (error) {
     console.error(error);
    res.status(500).json({ error: 'Error al asignar rol' });
    }
    });

    app.post('/suspension_usuario', verifyToken, async (req, res) => {
      try{
      const { user, estado } = req.body;
      const response = await axios.post('http://localhost:6002/estado', {
        user,
        estado
      });
  
      const registro = response.data
      res.json({ registro });
      } catch (error) {
       console.error(error);
      res.status(500).json({ error: 'Error al cambiar el estado' });
      }
      });

      

        app.get('/', (req, res) => {
          res.sendFile(__dirname + '/index.html');
        });
        

        
      



  app.listen(PORT, () => {
    console.log(`Servidor de suma corriendo en http://localhost:${PORT}`);
  });

