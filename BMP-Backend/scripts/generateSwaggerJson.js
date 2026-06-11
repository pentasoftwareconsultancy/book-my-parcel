import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book My Parcel API',
      version: '1.0.0',
      description: 'Complete API documentation for Book My Parcel - A logistics platform connecting parcel senders with travelers',
      contact: {
        name: 'Book My Parcel Support',
        email: 'support@bookmyparcel.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.bookmyparcel.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login',
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            phone_number: { type: 'string', example: '9876543210' },
            alternate_phone: { type: 'string', example: '9876543211' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            address: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', example: '400001' },
            avatar_url: { type: 'string', example: '/uploads/profiles/avatar.jpg' },
          },
        },
        
        // Auth Schemas
        SignupRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'phone_number', 'city', 'state'],
          properties: {
            name: { type: 'string', example: 'John Doe', pattern: '^[A-Za-z\\s]+$' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'Test@123', minLength: 8 },
            phone_number: { type: 'string', example: '9876543210', pattern: '^[6-9]\\d{9}$' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            referral_code: { type: 'string', example: 'ABC123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', format: 'password', example: 'Test@123' },
            role: { type: 'string', enum: ['INDIVIDUAL', 'TRAVELLER', 'ADMIN'], example: 'INDIVIDUAL' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: { $ref: '#/components/schemas/User' },
                activeRole: { type: 'string', example: 'INDIVIDUAL' },
                roles: { type: 'array', items: { type: 'string' }, example: ['INDIVIDUAL', 'TRAVELLER'] },
                kycStatus: { type: 'string', enum: ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'], example: 'NOT_STARTED' },
              },
            },
          },
        },
        
        // Add all other schemas from your swagger.config.js...
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication and authorization endpoints' },
      { name: 'User', description: 'User profile and order management' },
      { name: 'Parcel', description: 'Parcel request management' },
      { name: 'Traveller', description: 'Traveller profile and KYC' },
      { name: 'Traveller Routes', description: 'Traveller route management' },
      { name: 'Booking', description: 'Booking and OTP verification' },
      { name: 'Payment', description: 'Payment, wallet, and withdrawals' },
      { name: 'Tracking', description: 'Real-time parcel tracking' },
      { name: 'Places', description: 'Location and mapping services' },
      { name: 'Notifications', description: 'Push notifications management' },
      { name: 'Feedback', description: 'Ratings and reviews' },
      { name: 'Dispute', description: 'Dispute management' },
      { name: 'Admin', description: 'Admin panel operations' },
    ],
  },
  apis: [
    './src/modules/**/*.routes.js',
    './src/routes.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Write to docs folder for GitHub Pages
const docsPath = path.join(process.cwd(), '..', 'docs', 'swagger.json');
fs.writeFileSync(docsPath, JSON.stringify(swaggerSpec, null, 2));

console.log('✅ Swagger JSON generated successfully at:', docsPath);
console.log('📊 API paths found:', Object.keys(swaggerSpec.paths || {}).length);