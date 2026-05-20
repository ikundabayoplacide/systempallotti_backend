const swaggerJsdoc = require('swagger-jsdoc');

const port = process.env.PORT || 8000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Printing House API',
      version: '1.0.0',
      description: 'REST API for Printing House Management System',
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        // ── Auth ─────────────────────────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@printinghouse.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@printinghouse.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            phone: { type: 'string', example: '+250788000001' },
            role: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST', 'SALES', 'DAF', 'ACCOUNTANT', 'PRODUCTION_MANAGER', 'STOCK', 'SUPERVISOR', 'WORKER'], example: 'WORKER' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'oldpassword' },
            newPassword: { type: 'string', minLength: 6, example: 'newpassword123' },
          },
        },
        // ── User ─────────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '+250788000001', nullable: true },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true },
            role: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST', 'SALES', 'DAF', 'ACCOUNTANT', 'PRODUCTION_MANAGER', 'STOCK', 'SUPERVISOR', 'WORKER'] },
            departmentId: { type: 'string', format: 'uuid', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@printinghouse.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            phone: { type: 'string', example: '+250788000001' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
            departmentId: { type: 'string', format: 'uuid', example: 'aaaaaaaa-0001-4000-a000-000000000001' },
            role: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST', 'SALES', 'DAF', 'ACCOUNTANT', 'PRODUCTION_MANAGER', 'STOCK', 'SUPERVISOR', 'WORKER'], example: 'WORKER' },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '+250788000001' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
            departmentId: { type: 'string', format: 'uuid', nullable: true },
            role: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST', 'SALES', 'DAF', 'ACCOUNTANT', 'PRODUCTION_MANAGER', 'STOCK', 'SUPERVISOR', 'WORKER'] },
            isActive: { type: 'boolean' },
          },
        },
        // ── Customer ─────────────────────────────────────────────────────────
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Alice Mutoni' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '+250788000001' },
            company: { type: 'string', example: 'Acme Corp' },
            address: { type: 'string', example: 'KG 123 St' },
            notes: { type: 'string' },
            type: { type: 'string', enum: ['BUSINESS', 'VISITOR', 'BOUTIQUE'], example: 'BUSINESS' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCustomerRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'Alice Mutoni' },
            email: { type: 'string', format: 'email', example: 'alice@acmecorp.rw' },
            phone: { type: 'string', example: '+250788000001' },
            company: { type: 'string', example: 'Acme Corp' },
            address: { type: 'string', example: 'KG 123 St' },
            notes: { type: 'string' },
            type: { type: 'string', enum: ['BUSINESS', 'VISITOR', 'BOUTIQUE'], example: 'BUSINESS', description: 'BUSINESS or BOUTIQUE triggers a notification to Sales Managers' },
          },
        },
        UpdateCustomerRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            company: { type: 'string' },
            address: { type: 'string' },
            notes: { type: 'string' },
            type: { type: 'string', enum: ['BUSINESS', 'VISITOR', 'BOUTIQUE'] },
            isActive: { type: 'boolean' },
          },
        },
        // ── Product ──────────────────────────────────────────────────────────
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Business Cards' },
            description: { type: 'string' },
            category: { type: 'string', example: 'Cards' },
            basePrice: { type: 'number', format: 'float', example: 15.00 },
            unit: { type: 'string', example: '100 pcs' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'category', 'basePrice'],
          properties: {
            name: { type: 'string', example: 'Business Cards' },
            description: { type: 'string', example: 'Standard 85x55mm cards' },
            category: { type: 'string', example: 'Cards' },
            basePrice: { type: 'number', format: 'float', example: 15.00 },
            unit: { type: 'string', example: '100 pcs' },
          },
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            basePrice: { type: 'number', format: 'float' },
            unit: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        // ── Department ───────────────────────────────────────────────────────
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Printing' },
            description: { type: 'string', nullable: true, example: 'Handles all printing operations.' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateDepartmentRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Printing' },
            description: { type: 'string', example: 'Handles all printing operations.' },
          },
        },
        UpdateDepartmentRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Printing' },
            description: { type: 'string', example: 'Handles all printing operations.' },
            isActive: { type: 'boolean' },
          },
        },
        // ── Job ──────────────────────────────────────────────────────────────
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            jobNumber: { type: 'string', example: 'JOB-2026-001' },
            title: { type: 'string', example: 'Business Cards for Acme Corp' },
            description: { type: 'string', example: '500 double-sided business cards' },
            jobType: { type: 'string', example: 'business-card' },
            quantity: { type: 'integer', example: 500 },
            size: { type: 'string', example: 'A4' },
            colorMode: { type: 'string', example: 'full-color' },
            bindingType: { type: 'string', example: 'none' },
            amount: { type: 'number', format: 'float', example: 150.00, nullable: true },
            paymentStatus: { type: 'string', enum: ['unpaid', 'paid'], example: 'unpaid' },
            receiptNo: { type: 'string', example: 'RCP-2026-001', nullable: true },
            paymentMethod: { type: 'string', enum: ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'], nullable: true },
            paymentNote: { type: 'string', nullable: true },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            status: {
              type: 'string',
              enum: [
                'pending', 'confirmed', 'in-composition', 'in-montage',
                'in-printing', 'in-binding', 'in-packaging', 'quality-check',
                'ready-for-delivery', 'delivered', 'completed',
              ],
              example: 'pending',
            },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], example: 'normal' },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            customerId: { type: 'string', format: 'uuid' },
            createdById: { type: 'string', format: 'uuid' },
            departmentAssignedToId: { type: 'string', format: 'uuid', nullable: true },
            customer: { $ref: '#/components/schemas/Customer' },
            createdBy: { $ref: '#/components/schemas/User' },
            departmentAssignedTo: { $ref: '#/components/schemas/Department' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateJobRequest: {
          type: 'object',
          required: ['title', 'customerId'],
          properties: {
            title: { type: 'string', example: 'Business Cards for Acme Corp' },
            description: { type: 'string', example: '500 double-sided business cards' },
            jobType: { type: 'string', example: 'business-card' },
            quantity: { type: 'integer', minimum: 1, example: 500 },
            size: { type: 'string', example: 'A4' },
            colorMode: { type: 'string', example: 'full-color' },
            bindingType: { type: 'string', example: 'none' },
            amount: { type: 'number', format: 'float', minimum: 0, example: 150.00 },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], example: 'normal' },
            dueDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            customerId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
          },
        },
        UpdateJobRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            jobType: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 },
            size: { type: 'string' },
            colorMode: { type: 'string' },
            bindingType: { type: 'string' },
            amount: { type: 'number', format: 'float', minimum: 0 },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            departmentAssignedToId: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        UpdateJobStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: [
                'confirmed', 'in-composition', 'in-montage', 'in-printing',
                'in-binding', 'in-packaging', 'quality-check',
                'ready-for-delivery', 'delivered', 'completed',
              ],
              example: 'confirmed',
            },
          },
        },
        AssignJobRequest: {
          type: 'object',
          required: ['departmentAssignedToId'],
          properties: {
            departmentAssignedToId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...', description: 'ID of the department to assign this job to' },
          },
        },
        // ── Payment ──────────────────────────────────────────────────────────
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            jobId: { type: 'string', format: 'uuid' },
            recordedById: { type: 'string', format: 'uuid' },
            receivedById: { type: 'string', format: 'uuid' },
            verifiedById: { type: 'string', format: 'uuid', nullable: true },
            receiptNo: { type: 'string', example: 'RCP-2026-001' },
            amountPaid: { type: 'number', format: 'float', example: 150.00 },
            balance: { type: 'number', format: 'float', example: 50.00 },
            paymentMethod: { type: 'string', enum: ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'], example: 'CASH' },
            paymentState: { type: 'string', enum: ['FULL', 'PARTIAL'], example: 'FULL' },
            paymentNote: { type: 'string', nullable: true },
            paidAt: { type: 'string', format: 'date-time' },
            job: { $ref: '#/components/schemas/Job' },
            recordedBy: { $ref: '#/components/schemas/User' },
            receivedBy: { $ref: '#/components/schemas/User' },
            verifiedBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePaymentRequest: {
          type: 'object',
          required: ['jobId', 'amountPaid', 'paymentMethod', 'paymentState', 'receivedById'],
          properties: {
            jobId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            amountPaid: { type: 'number', format: 'float', minimum: 0.01, example: 150.00 },
            paymentMethod: { type: 'string', enum: ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'], example: 'CASH' },
            paymentState: { type: 'string', enum: ['FULL', 'PARTIAL'], example: 'FULL' },
            receivedById: { type: 'string', format: 'uuid', description: 'ID of the receptionist who accepted the payment' },
            verifiedById: { type: 'string', format: 'uuid', nullable: true, description: 'ID of the accountant who verified the payment (optional)' },
            paymentNote: { type: 'string', example: 'Paid via MTN Mobile Money' },
          },
        },
        // ── Notification ─────────────────────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Job Assigned' },
            message: { type: 'string', example: 'Job JOB-2026-001 has been assigned to Binding department.' },
            type: {
              type: 'string',
              enum: ['JOB_CREATED', 'JOB_ASSIGNED', 'JOB_STATUS_CHANGED', 'DEPARTMENT_ASSIGNED', 'GENERAL'],
              example: 'JOB_ASSIGNED',
            },
            isRead: { type: 'boolean', example: false },
            relatedEntityType: { type: 'string', nullable: true, example: 'job' },
            relatedEntityId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Shared ───────────────────────────────────────────────────────────
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Products', description: 'Product catalogue management' },
      { name: 'Departments', description: 'Department management' },
      { name: 'Jobs', description: 'Job registration and workflow management' },
      { name: 'Payments', description: 'Payment recording and management' },
      { name: 'Notifications', description: 'User notifications' },
    ],
    paths: {
      // ── Auth ───────────────────────────────────────────────────────────────
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive a JWT token',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              token: { type: 'string' },
                              user: { $ref: '#/components/schemas/User' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user (Admin only)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } }] } } },
            },
            409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get the currently authenticated user',
          responses: {
            200: {
              description: 'Current user data',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } }] } } },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/change-password': {
        put: {
          tags: ['Auth'],
          summary: "Change the authenticated user's password",
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
          },
          responses: {
            200: { description: 'Password changed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Current password is incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Users ──────────────────────────────────────────────────────────────
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name or email' },
            { in: 'query', name: 'role', schema: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST', 'SALES', 'DAF', 'ACCOUNTANT', 'PRODUCTION_MANAGER', 'STOCK', 'SUPERVISOR', 'WORKER'] } },
          ],
          responses: {
            200: {
              description: 'Paginated list of users',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }] } } },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a new user (Admin only)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } },
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } }] } } },
            },
            409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get a user by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'User data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } }] } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update a user',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } } },
          responses: {
            200: { description: 'User updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } }] } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Soft delete a user (sets deletedAt)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'User deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Customers ──────────────────────────────────────────────────────────
      '/api/customers': {
        get: {
          tags: ['Customers'],
          summary: 'Get all customers (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name, email, company or phone' },
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['BUSINESS', 'VISITOR', 'BOUTIQUE'] }, description: 'Filter by customer type' },
          ],
          responses: {
            200: { description: 'Paginated list of customers', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Customer' } } } }] } } } },
          },
        },
        post: {
          tags: ['Customers'],
          summary: 'Create a new customer',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCustomerRequest' } } } },
          responses: {
            201: { description: 'Customer created successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Customer' } } }] } } } },
            409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/customers/{id}': {
        get: {
          tags: ['Customers'],
          summary: 'Get a customer by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Customer data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Customer' } } }] } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Customers'],
          summary: 'Update a customer',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCustomerRequest' } } } },
          responses: {
            200: { description: 'Customer updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Customer' } } }] } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Customers'],
          summary: 'Delete a customer (soft delete)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Customer deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Products ───────────────────────────────────────────────────────────
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name or description' },
            { in: 'query', name: 'category', schema: { type: 'string' }, description: 'Filter by category' },
          ],
          responses: {
            200: { description: 'Paginated list of products', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } }] } } } },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductRequest' } } } },
          responses: {
            201: { description: 'Product created successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Product' } } }] } } } },
          },
        },
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get a product by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Product data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Product' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Update a product',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProductRequest' } } } },
          responses: {
            200: { description: 'Product updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Product' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete a product (soft delete)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Product deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Departments ────────────────────────────────────────────────────────
      '/api/departments': {
        get: {
          tags: ['Departments'],
          summary: 'Get all departments (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name or description' },
            { in: 'query', name: 'all', schema: { type: 'boolean' }, description: 'If true, include inactive departments' },
          ],
          responses: {
            200: { description: 'Paginated list of departments', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Department' } } } }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Departments'],
          summary: 'Create a new department (Admin only)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDepartmentRequest' } } } },
          responses: {
            201: { description: 'Department created successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Department' } } }] } } } },
            409: { description: 'Department name already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/departments/{id}': {
        get: {
          tags: ['Departments'],
          summary: 'Get a department by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Department data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Department' } } }] } } } },
            404: { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Departments'],
          summary: 'Update a department (Admin only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDepartmentRequest' } } } },
          responses: {
            200: { description: 'Department updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Department' } } }] } } } },
            404: { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Departments'],
          summary: 'Delete a department (soft delete, Admin only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Department deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/departments/{id}/jobs': {
        get: {
          tags: ['Departments'],
          summary: 'Get all jobs assigned to a department',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Department ID' },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending','confirmed','in-composition','in-montage','in-printing','in-binding','in-packaging','quality-check','ready-for-delivery','delivered','completed'] } },
            { in: 'query', name: 'priority', schema: { type: 'string', enum: ['low','normal','high','urgent'] } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by job number or title' },
          ],
          responses: {
            200: {
              description: 'Paginated list of jobs for the department',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } }] } } },
            },
            404: { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Jobs ───────────────────────────────────────────────────────────────
      '/api/jobs/number/{jobNumber}': {
        get: {
          tags: ['Jobs'],
          summary: 'Get a job by its job number (e.g. JOB-2026-001)',
          parameters: [
            { in: 'path', name: 'jobNumber', required: true, schema: { type: 'string' }, example: 'JOB-2026-001', description: 'Human-readable job number' },
          ],
          responses: {
            200: { description: 'Job data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Job' } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/next-number': {
        get: {
          tags: ['Jobs'],
          summary: 'Preview the next auto-generated job number',
          responses: {
            200: {
              description: 'Next job number',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { jobNumber: { type: 'string', example: 'JOB-2026-001' } } } } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/jobs': {
        get: {
          tags: ['Jobs'],
          summary: 'Get all jobs (paginated, filterable)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by job number or title' },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending','confirmed','in-composition','in-montage','in-printing','in-binding','in-packaging','quality-check','ready-for-delivery','delivered','completed'] } },
            { in: 'query', name: 'priority', schema: { type: 'string', enum: ['low','normal','high','urgent'] } },
            { in: 'query', name: 'customerId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'assignedToId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'departmentAssignedToId', schema: { type: 'string', format: 'uuid' }, description: 'Filter by assigned department' },
          ],
          responses: {
            200: {
              description: 'Paginated list of jobs',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } }] } } },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Jobs'],
          summary: 'Register a new job for a customer',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateJobRequest' } } },
          },
          responses: {
            201: {
              description: 'Job registered successfully',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Job' } } }] } } },
            },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}': {
        get: {
          tags: ['Jobs'],
          summary: 'Get a job by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Job data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Job' } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Jobs'],
          summary: 'Update job details',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateJobRequest' } } } },
          responses: {
            200: { description: 'Job updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Job' } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Jobs'],
          summary: 'Delete a job (only pending or confirmed jobs)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Job deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job cannot be deleted in its current status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/status': {
        patch: {
          tags: ['Jobs'],
          summary: 'Advance job to the next status',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateJobStatusRequest' } } } },
          responses: {
            200: {
              description: 'Job status updated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, status: { type: 'string' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Invalid status transition', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/assign': {
        post: {
          tags: ['Jobs'],
          summary: 'Assign a job to a department',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignJobRequest' } } } },
          responses: {
            200: {
              description: 'Job assigned to department successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, departmentAssignedTo: { $ref: '#/components/schemas/Department' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job or department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/completed-and-paid': {
        get: {
          tags: ['Jobs'],
          summary: 'Get all completed and paid jobs (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by job number or title' },
          ],
          responses: {
            200: { description: 'Paginated list of completed and paid jobs', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } }] } } } },
          },
        },
      },
      '/api/jobs/{id}/deliver': {
        patch: {
          tags: ['Jobs'],
          summary: 'Mark a job as delivered (must be in completed status)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Job marked as delivered',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, status: { type: 'string', example: 'delivered' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Job already delivered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job not in completed status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/complete': {
        patch: {
          tags: ['Jobs'],
          summary: 'Mark a job as completed (can be called from any active status)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Job marked as completed',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, status: { type: 'string', example: 'completed' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Job already completed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job not in delivered status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Payments ───────────────────────────────────────────────────────────
      '/api/payments': {
        get: {
          tags: ['Payments'],
          summary: 'Get all payments (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'jobId', schema: { type: 'string', format: 'uuid' }, description: 'Filter by job' },
            { in: 'query', name: 'paymentMethod', schema: { type: 'string', enum: ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'] } },
            { in: 'query', name: 'paymentState', schema: { type: 'string', enum: ['FULL', 'PARTIAL'] } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by receipt number' },
          ],
          responses: {
            200: { description: 'Paginated list of payments', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } }] } } } },
          },
        },
        post: {
          tags: ['Payments'],
          summary: 'Record a payment for a job',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentRequest' } } } },
          responses: {
            201: { description: 'Payment recorded successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Payment' } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/payments/job/{jobId}': {
        get: {
          tags: ['Payments'],
          summary: 'Get all payments for a specific job',
          parameters: [
            { in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Paginated list of payments for the job', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/payments/{id}': {
        get: {
          tags: ['Payments'],
          summary: 'Get a payment by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Payment data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Payment' } } }] } } } },
            404: { description: 'Payment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Notifications ──────────────────────────────────────────────────────
      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get my notifications (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'unreadOnly', schema: { type: 'boolean' }, description: 'If true, return only unread notifications' },
          ],
          responses: {
            200: { description: 'Paginated list of notifications', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Notifications'],
          summary: 'Delete all my notifications',
          responses: {
            200: { description: 'All notifications deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get count of unread notifications',
          responses: {
            200: {
              description: 'Unread count',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'object', properties: { unreadCount: { type: 'integer', example: 5 } } } } }] } } },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          responses: {
            200: { description: 'All notifications marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark a single notification as read',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Notification marked as read', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Notification' } } }] } } } },
            404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/notifications/{id}': {
        delete: {
          tags: ['Notifications'],
          summary: 'Delete a single notification',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Notification deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
  },
  apis: [], // all docs are defined inline above — no file scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
