// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API',
      version: '1.0.0',
      description: 'A mock API that documents a personal portfolio website',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'], // You'll define docs here for simplicity
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
