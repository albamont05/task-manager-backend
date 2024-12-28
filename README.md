# API de Gestión de Tareas (con Node.js, Express y MongoDB)

[![Tests](https://github.com/<tu-usuario>/<tu-repositorio>/actions/workflows/node.js.yml/badge.svg)](https://github.com/<tu-usuario>/<tu-repositorio>/actions/workflows/node.js.yml)
[![Código de Conducta](https://img.shields.io/badge/Contributor%20Covenant-2.1-494949.svg)](CODE_OF_CONDUCT.md)
[![Licencia MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Este proyecto es una API RESTful construida con Node.js, Express y MongoDB para la gestión de tareas. Permite crear, leer, actualizar y eliminar tareas, proporcionando una solución robusta y escalable para la administración de listas de tareas.

## Características

*   CRUD completo de tareas (Crear, Leer, Actualizar, Eliminar).
*   Validación de datos.
*   Manejo de errores robusto.
*   Pruebas unitarias y de integración con Jest y Supertest.
*   Documentación con Swagger.
*   Variables de entorno para configuración.
*   Uso de Mongoose para la interacción con MongoDB.

## Tecnologías Utilizadas

*   [Node.js](https://nodejs.org/)
*   [Express](https://expressjs.com/)
*   [MongoDB](https://www.mongodb.com/)
*   [Mongoose](https://mongoosejs.com/)
*   [Jest](https://jestjs.io/)
*   [Supertest](https://github.com/visionmedia/supertest)
*   [Dotenv](https://www.npmjs.com/package/dotenv) (para variables de entorno)
*   [Swagger](https://swagger.io/) (opcional, para la documentación de la API)

## Requisitos Previos

*   [Node.js](https://nodejs.org/) (versión LTS recomendada)
*   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/) o [pnpm](https://pnpm.io/)
*   [MongoDB](https://www.mongodb.com/) (servidor en ejecución)

## Instalación

1.  Clona el repositorio:

    ```bash
    git clone [https://github.com/](https://github.com/)<tu-usuario>/<tu-repositorio>.git
    ```

2.  Navega al directorio del proyecto:

    ```bash
    cd <tu-repositorio>
    ```

3.  Instala las dependencias:

    ```bash
    npm install  # o yarn install o pnpm install
    ```

4.  Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno (consulta el archivo `.env.example` para un ejemplo):

    ```
    MONGODB_URI=mongodb://localhost:27017/<nombre-de-tu-base-de-datos>
    PORT=3000
    MONGODB_URI_TEST=mongodb://localhost:27017/<nombre-de-tu-base-de-datos-de-test>
    ```

## Ejecución

```bash
npm run dev # Para el desarrollo con reinicio automático (nodemon)
npm start  # Para producción
