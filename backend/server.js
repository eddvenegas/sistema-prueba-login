const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const movimientosRoutes = require('./routes/movimientos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu React
  credentials: true,
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/movimientos', movimientosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API UGEL funcionando correctamente ✅' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
