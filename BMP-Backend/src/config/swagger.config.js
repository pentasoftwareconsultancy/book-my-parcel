import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
        
        // Address Schema
        Address: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            street: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', example: '400001' },
            country: { type: 'string', example: 'India' },
            phone: { type: 'string', example: '9876543210' },
            latitude: { type: 'number', format: 'float', example: 19.0760 },
            longitude: { type: 'number', format: 'float', example: 72.8777 },
          },
        },
        
        // Parcel Schemas
        Parcel: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            parcel_ref: { type: 'string', example: 'BMP-ABC123' },
            user_id: { type: 'string', format: 'uuid' },
            pickup_address_id: { type: 'string', format: 'uuid' },
            delivery_address_id: { type: 'string', format: 'uuid' },
            weight_kg: { type: 'number', format: 'float', example: 5.5 },
            length_in: { type: 'number', format: 'float', example: 12 },
            width_in: { type: 'number', format: 'float', example: 10 },
            height_in: { type: 'number', format: 'float', example: 8 },
            parcel_type: { $ref: '#/components/schemas/ParcelType' },
            vehicle_type: { $ref: '#/components/schemas/VehicleType' },
            pickup_date: { type: 'string', format: 'date', example: '2024-06-15' },
            pickup_time: { type: 'string', format: 'time', example: '10:00' },
            notes: { type: 'string', example: 'Handle with care' },
            estimated_price: { type: 'number', format: 'float', example: 500 },
            status: { $ref: '#/components/schemas/ParcelStatus' },
            form_step: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ParcelType: {
          type: 'string',
          enum: ['DOCUMENTS', 'ELECTRONICS', 'CLOTHING', 'FOOD', 'FRAGILE', 'OTHER'],
          example: 'DOCUMENTS',
        },
        VehicleType: {
          type: 'string',
          enum: ['CAR', 'BIKE', 'SCOOTER', 'PUBLIC_TRANSPORT'],
          example: 'CAR',
        },
        ParcelStatus: {
          type: 'string',
          enum: ['PENDING', 'PARTNER_SELECTED', 'PAYMENT_PENDING', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
          example: 'PENDING',
        },
        
        // Traveller Schemas
        TravellerKYC: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            dob: { type: 'string', format: 'date', example: '1990-01-15' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
            address: { type: 'string', example: '123 Main Street, Mumbai' },
            aadhar_number: { type: 'string', example: 'XXXX XXXX 1234' },
            pan_number: { type: 'string', example: 'XXXXX1234F' },
            driving_number: { type: 'string', example: 'MH01202300001' },
            account_number: { type: 'string', example: '12345678901234' },
            account_holder: { type: 'string', example: 'John Doe' },
            ifsc: { type: 'string', example: 'SBIN0001234' },
            bank_name: { type: 'string', example: 'State Bank of India' },
            status: { $ref: '#/components/schemas/KYCStatus' },
            bank_verified: { type: 'boolean', example: false },
          },
        },
        KYCStatus: {
          type: 'string',
          enum: ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'],
          example: 'PENDING',
        },
        TravellerRoute: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            originCity: { type: 'string', example: 'Mumbai' },
            originState: { type: 'string', example: 'Maharashtra' },
            originLat: { type: 'number', format: 'float', example: 19.0760 },
            originLng: { type: 'number', format: 'float', example: 72.8777 },
            destinationCity: { type: 'string', example: 'Pune' },
            destinationState: { type: 'string', example: 'Maharashtra' },
            destinationLat: { type: 'number', format: 'float', example: 18.5204 },
            destinationLng: { type: 'number', format: 'float', example: 73.8567 },
            departureDate: { type: 'string', format: 'date', example: '2024-06-15' },
            departureTime: { type: 'string', format: 'time', example: '09:00' },
            arrivalDate: { type: 'string', format: 'date', example: '2024-06-15' },
            arrivalTime: { type: 'string', format: 'time', example: '13:00' },
            vehicleType: { $ref: '#/components/schemas/VehicleType' },
            capacityKg: { type: 'number', format: 'float', example: 50 },
            acceptedParcelTypes: { type: 'array', items: { $ref: '#/components/schemas/ParcelType' } },
            transportMode: { type: 'string', enum: ['DRIVE', 'TWO_WHEELER', 'WALK'], example: 'DRIVE' },
            status: { type: 'string', enum: ['active', 'inactive', 'completed'], example: 'active' },
          },
        },
        
        // Booking Schemas
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            booking_ref: { type: 'string', example: 'BMP12345678' },
            tracking_ref: { type: 'string', example: 'UBG-123456789012' },
            parcel_id: { type: 'string', format: 'uuid' },
            traveller_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            status: { $ref: '#/components/schemas/BookingStatus' },
            payment_mode: { type: 'string', enum: ['PAY_NOW', 'PAY_AFTER_DELIVERY'], example: 'PAY_NOW' },
            amount: { type: 'number', format: 'float', example: 500 },
            pickup_otp: { type: 'string', example: '1234' },
            delivery_otp: { type: 'string', example: '5678' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        BookingStatus: {
          type: 'string',
          enum: ['CREATED', 'MATCHING', 'CONFIRMED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
          example: 'CONFIRMED',
        },
        
        // Payment Schemas
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            parcel_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            razorpay_order_id: { type: 'string', example: 'order_xyz123' },
            razorpay_payment_id: { type: 'string', example: 'pay_abc456' },
            amount: { type: 'number', format: 'float', example: 500 },
            currency: { type: 'string', example: 'INR' },
            status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED'], example: 'SUCCESS' },
            payment_method: { type: 'string', example: 'card' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            balance: { type: 'number', format: 'float', example: 1500.50 },
            currency: { type: 'string', example: 'INR' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        WalletTransaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            wallet_id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
            amount: { type: 'number', format: 'float', example: 500 },
            description: { type: 'string', example: 'Delivery earnings' },
            balance_after: { type: 'number', format: 'float', example: 2000 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        
        // Notification Schema
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['user', 'traveller', 'admin'], example: 'user' },
            title: { type: 'string', example: 'Booking Confirmed' },
            message: { type: 'string', example: 'Your parcel booking has been confirmed' },
            type: { type: 'string', example: 'booking_confirmed' },
            is_read: { type: 'boolean', example: false },
            metadata: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        
        // Feedback Schema
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            booking_id: { type: 'string', format: 'uuid' },
            from_user_id: { type: 'string', format: 'uuid' },
            to_user_id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent service!' },
            tags: { type: 'array', items: { type: 'string' }, example: ['punctual', 'professional'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        
        // Dispute Schema
        Dispute: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            booking_id: { type: 'string', format: 'uuid' },
            raised_by: { type: 'string', format: 'uuid' },
            against_user: { type: 'string', format: 'uuid' },
            reason: { $ref: '#/components/schemas/DisputeReason' },
            description: { type: 'string', example: 'Package arrived damaged' },
            status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'OPEN' },
            resolution: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        DisputeReason: {
          type: 'string',
          enum: ['ITEM_DAMAGED', 'NOT_DELIVERED', 'WRONG_ITEM', 'PAYMENT_ISSUE', 'OTHER'],
          example: 'ITEM_DAMAGED',
        },
        
        // Generic Response Schemas
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
        PaginationResponse: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 100 },
            itemsPerPage: { type: 'integer', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
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
    './BMP-Backend/src/modules/**/*.routes.js',
    './BMP-Backend/src/routes.js'
  ], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };