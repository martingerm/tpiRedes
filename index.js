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

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Datos recibidos:', req.body);
  //Lógica de user y pass
  if (username === 'tpi' && password === '1234') {
    const token = generateToken({ username });
    res.json({ token }); //Devuelve token con 1h. de validez
  } else {
    console.log('hola');
    res.status(401).json({ error: 'Credenciales incorrectas' });
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
      const response = await axios.post('http://localhost:6002/suspension', {
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

      app.post('/habilitacion_usuario', verifyToken, async (req, res) => {
        try{
        const { user, estado } = req.body;
        const response = await axios.post('http://localhost:6002/habilitacion', {
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

