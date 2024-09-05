import swaggereJsdoc from 'swagger-jsdoc';

const options = {
    explorer: true,
    swaggerOptions: {
        validatorUrl: null
    },
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hotube API',
            version: '1.0.0',
            description: '',
        },
        basePath: '/',
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'apiKey',
                    scheme: 'bearer',
                    name: 'access',
                    in: 'header',
                }
            },
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        servers: [
            {
                url: `http://localhost:8080`,
                description: `local`,
            }
        ],
    },
    apis: ['./src/routes/**/**/**.ts'],
    schemes: ['http', 'https'],
};

export const specs = swaggereJsdoc(options);