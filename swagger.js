const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Verido API',
            version: '1.0.0',
            description: 'API documentation for Market Products',
        },
        servers: [
            {
                url: 'https://bknd.verido.app',
            },
        ],
    },
    apis: ['./server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
