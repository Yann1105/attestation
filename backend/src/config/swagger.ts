import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Attestation & Canvas API',
            version: '1.0.0',
            description: 'API for certificate management, Photoshop-like features, and AI-powered Canvas template generation.',
        },
        servers: [
            {
                url: 'http://localhost:3002/api',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/features/**/*.routes.ts',
        './src/features/**/routes.ts',
        './src/features/**/*.controller.ts' // Include controllers for Swagger annotations
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
