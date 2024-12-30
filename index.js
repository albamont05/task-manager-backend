require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const tasksRouter = require("./routes/tasks");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const whitelist = ['http://localhost:5173', ' https://task-manager-backend-474c.onrender.com']; // Lista de orígenes permitidos

// Configuración cors
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) { // Verifica si el origen está en la lista blanca O si origin es undefined (peticiones desde el mismo origen)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  credentials: true, // Si necesitas enviar cookies o credenciales
  optionsSuccessStatus: 204
};

const swaggerDocsPath = "/api-docs";

// Configuración Swagger (OpenAPI 3.0)
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description: "API para gestionar tareas",
    },
    servers: [
      {
        url: `https://task-manager-backend-474c.onrender.com:${port}/api`, // URL base de la API (con /api si es necesario)
      },
    ],
  },
  apis: ["./routes/*.js"], // Rutas donde están los comentarios Swagger
};

const specs = swaggerJsdoc(options);

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/tasks", tasksRouter);
app.use(swaggerDocsPath, swaggerUi.serve, swaggerUi.setup(specs));

let server;

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Conexión para la app principal
    console.log("Conectado a MongoDB");
  } catch (err) {
    console.error("Error de conexión a MongoDB:", err);
    process.exit(1); // Importante: salir del proceso si falla la conexión
  }
}

// CONDICIÓN CRUCIAL: Solo iniciar el servidor si NO estamos en test
if (process.env.NODE_ENV === "development") {
  connectToDatabase();

  server = app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
    console.log(
      `Documentación disponible en: https://task-manager-backend-474c.onrender.com${swaggerDocsPath}`
    );
  });

} else {
    console.log("No se inicia el servidor en test");
}

module.exports = { app, server };
