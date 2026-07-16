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
            currentJobId: { type: 'string', format: 'uuid', nullable: true },
            isActive: { type: 'boolean' },
            department: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string', example: 'Printing' },
              },
            },
            currentJob: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                jobNumber: { type: 'string', example: 'JOB-2026-001' },
                title: { type: 'string', example: 'Business Cards' },
                state: { type: 'string', nullable: true, example: 'in-printing' },
                status: { type: 'string', example: 'confirmed' },
                priority: { type: 'string', example: 'normal' },
              },
            },
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
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', example: '+250788000001', nullable: true },
            company: { type: 'string', example: 'Acme Corp', nullable: true },
            tin: { type: 'string', example: '123456789', nullable: true, description: 'Tax Identification Number for company customers' },
            address: { type: 'string', example: 'KG 123 St', nullable: true },
            notes: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['BUSINESS', 'VISITOR', 'BOUTIQUE'], example: 'BUSINESS' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCustomerRequest: {
          type: 'object',
          required: ['name', 'phone'],
          properties: {
            name: { type: 'string', example: 'Alice Mutoni' },
            email: { type: 'string', format: 'email', example: 'alice@acmecorp.rw', description: 'Optional' },
            phone: { type: 'string', example: '+250788000001', description: 'Required. Include country code e.g. +250788000001' },
            company: { type: 'string', example: 'Acme Corp' },
            tin: { type: 'string', example: '123456789', description: 'TIN number for company customers' },
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
            tin: { type: 'string' },
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
            deliveredByName: { type: 'string', nullable: true, example: 'John Doe' },
            deliveredByContact: { type: 'string', nullable: true, example: '+250788000001' },
            receiptNo: { type: 'string', example: 'RCP-2026-001', nullable: true },
            paymentMethod: { type: 'string', enum: ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'], nullable: true },
            paymentNote: { type: 'string', nullable: true },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'rejected', 'delivered', 'completed'],
              example: 'pending',
            },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], example: 'normal' },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            rejectReason: { type: 'string', nullable: true, example: 'Missing required artwork files', description: 'Reason for rejection, populated when status is rejected' },
            state: {
              type: 'string',
              enum: [
                'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging', 'quality-check',
                'composition-done', 'montage-done', 'printing-done', 'binding-done', 'packaging-done', 'qualitycheck-done',
              ],
              nullable: true,
              example: 'in-printing',
              description: 'Production state — set on assignment; supervisor marks it done when department finishes',
            },
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
            items: {
              type: 'array',
              description: 'Stock items needed for this job',
              items: {
                type: 'object',
                required: ['stockItemId', 'quantityNeeded'],
                properties: {
                  stockItemId: { type: 'string', format: 'uuid' },
                  quantityNeeded: { type: 'number', minimum: 0.01, example: 5 },
                  notes: { type: 'string', nullable: true },
                },
              },
            },
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
              enum: ['confirmed', 'rejected', 'delivered', 'completed'],
              example: 'confirmed',
            },
          },
        },
        RejectJobRequest: {
          type: 'object',
          properties: {
            rejectReason: { type: 'string', nullable: true, maxLength: 1000, example: 'Missing required artwork files', description: 'Optional reason for rejection' },
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
        // ── Role ──────────────────────────────────────────────────────────────
        Role: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'SALES' },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            isSystem: { type: 'boolean', description: 'System roles cannot be deleted' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Permission ────────────────────────────────────────────────────────
        Permission: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'jobs.create' },
            resource: { type: 'string', example: 'jobs' },
            action: { type: 'string', example: 'create' },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── CustomerVisit ─────────────────────────────────────────────────────
        CustomerVisit: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            recordedById: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['IN', 'OUT'], example: 'IN' },
            checkinAt: { type: 'string', format: 'date-time' },
            checkoutAt: { type: 'string', format: 'date-time', nullable: true },
            purpose: { type: 'string', nullable: true, example: 'Job pickup' },
            notes: { type: 'string', nullable: true },
            customer: { $ref: '#/components/schemas/Customer' },
            recordedBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Quotation ─────────────────────────────────────────────────────────
        Quotation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            quotationNo: { type: 'string', example: 'QT-2026-001' },
            jobId: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            createdById: { type: 'string', format: 'uuid' },
            subtotal: { type: 'number', format: 'float', example: 150000 },
            taxRate: { type: 'number', format: 'float', example: 18 },
            taxAmount: { type: 'number', format: 'float', example: 27000 },
            discount: { type: 'number', format: 'float', example: 0 },
            totalAmount: { type: 'number', format: 'float', example: 177000 },
            status: { type: 'string', enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], example: 'draft' },
            validUntil: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            terms: { type: 'string', nullable: true },
            job: { $ref: '#/components/schemas/Job' },
            customer: { $ref: '#/components/schemas/Customer' },
            createdBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── JobItem ───────────────────────────────────────────────────────────
        JobItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            jobId: { type: 'string', format: 'uuid' },
            stockItemId: { type: 'string', format: 'uuid' },
            quantityNeeded: { type: 'number', format: 'float', example: 5 },
            quantityUsed: { type: 'number', format: 'float', nullable: true, example: 4.5 },
            notes: { type: 'string', nullable: true },
            stockItem: { $ref: '#/components/schemas/StockItem' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Stock ─────────────────────────────────────────────────────────────
        StockItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            itemName: { type: 'string', example: 'A4 Paper Reams' },
            category: { type: 'string', example: 'Paper', nullable: true },
            unit: { type: 'string', example: 'reams', nullable: true },
            description: { type: 'string', nullable: true },
            supplier: { type: 'string', nullable: true },
            unitCost: { type: 'number', format: 'float', nullable: true },
            currentStock: { type: 'number', format: 'float', example: 50 },
            alarmStock: { type: 'number', format: 'float', example: 10 },
            stockStatus: { type: 'string', enum: ['in-stock', 'low-stock', 'out-of-stock'], example: 'in-stock' },
            type: { type: 'string', enum: ['boutique', 'hobe', 'general'], example: 'general', description: 'Department this stock item belongs to. HOBE users only see hobe-type items.' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateStockItemRequest: {
          type: 'object',
          required: ['itemName'],
          properties: {
            itemName: { type: 'string', example: 'A4 Paper Reams' },
            category: { type: 'string', example: 'Paper' },
            unit: { type: 'string', example: 'reams' },
            description: { type: 'string' },
            supplier: { type: 'string', example: 'ABC Supplies' },
            unitCost: { type: 'number', format: 'float', minimum: 0, example: 5000 },
            currentStock: { type: 'number', format: 'float', minimum: 0, example: 0, description: 'Initial stock quantity (default 0)' },
            alarmStock: { type: 'number', format: 'float', minimum: 0, example: 5, description: 'Low-stock threshold (default 5)' },
            type: { type: 'string', enum: ['boutique', 'hobe', 'general'], example: 'general', description: 'Department this item belongs to. Defaults to general.' },
          },
        },
        UpdateStockItemRequest: {
          type: 'object',
          properties: {
            itemName: { type: 'string', example: 'A4 Paper Reams' },
            category: { type: 'string', example: 'Paper' },
            unit: { type: 'string', example: 'reams' },
            description: { type: 'string' },
            supplier: { type: 'string' },
            unitCost: { type: 'number', format: 'float', minimum: 0 },
            alarmStock: { type: 'number', format: 'float', minimum: 0 },
            type: { type: 'string', enum: ['boutique', 'hobe', 'general'], description: 'Change the department this item belongs to.' },
            isActive: { type: 'boolean' },
          },
        },
        StockEntry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            stockItemId: { type: 'string', format: 'uuid' },
            receivedById: { type: 'string', format: 'uuid' },
            quantityIn: { type: 'number', format: 'float', example: 20 },
            unitCost: { type: 'number', format: 'float', nullable: true },
            totalCost: { type: 'number', format: 'float', nullable: true },
            supplier: { type: 'string', nullable: true },
            referenceNo: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            stockBefore: { type: 'number', format: 'float' },
            stockAfter: { type: 'number', format: 'float' },
            entryDate: { type: 'string', format: 'date-time' },
            stockItem: { $ref: '#/components/schemas/StockItem' },
            receivedBy: { $ref: '#/components/schemas/User' },
          },
        },
        StockSortie: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            stockItemId: { type: 'string', format: 'uuid' },
            requesterId: { type: 'string', format: 'uuid' },
            approvedById: { type: 'string', format: 'uuid', nullable: true },
            jobId: { type: 'string', format: 'uuid', nullable: true },
            dossierNo: { type: 'string', nullable: true, example: 'JOB-2026-001' },
            quantityOut: { type: 'number', format: 'float', example: 5 },
            reason: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            stockBefore: { type: 'number', format: 'float' },
            stockAfter: { type: 'number', format: 'float' },
            sortieDate: { type: 'string', format: 'date-time' },
            stockItem: { $ref: '#/components/schemas/StockItem' },
            requester: { $ref: '#/components/schemas/User' },
            approvedBy: { $ref: '#/components/schemas/User' },
            job: { $ref: '#/components/schemas/Job' },
          },
        },
        // ── MaterialRequest ───────────────────────────────────────────────────
        MaterialRequestItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            materialRequestId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'A4 Paper Reams' },
            quantity: { type: 'number', format: 'float', example: 5 },
            unit: { type: 'string', example: 'reams' },
          },
        },
        MaterialRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            requestNumber: { type: 'string', example: 'MR-2026-001' },
            jobId: { type: 'string', format: 'uuid' },
            employeeId: { type: 'string', format: 'uuid' },
            notes: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            responseNotes: { type: 'string', nullable: true },
            respondedBy: { type: 'string', format: 'uuid', nullable: true },
            respondedAt: { type: 'string', format: 'date-time', nullable: true },
            items: { type: 'array', items: { $ref: '#/components/schemas/MaterialRequestItem' } },
            job: { $ref: '#/components/schemas/Job' },
            employee: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateMaterialRequestRequest: {
          type: 'object',
          required: ['jobId', 'items'],
          properties: {
            jobId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            notes: { type: 'string', example: 'Needed urgently for tomorrow' },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['name', 'quantity', 'unit'],
                properties: {
                  name: { type: 'string', example: 'A4 Paper Reams' },
                  quantity: { type: 'number', format: 'float', minimum: 0.01, example: 5 },
                  unit: { type: 'string', example: 'reams' },
                },
              },
            },
          },
        },
        RespondMaterialRequestRequest: {
          type: 'object',
          properties: {
            responseNotes: { type: 'string', example: 'Approved, will be delivered shortly' },
          },
        },
        // ── Boutique ─────────────────────────────────────────────────────────
        BoutiqueCategory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Printing' },
            skuPrefix: { type: 'string', example: 'PRN' },
            colorClass: { type: 'string', example: 'bg-blue-100', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BoutiqueProduct: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sku: { type: 'string', example: 'PRN-001' },
            name: { type: 'string', example: 'Business Cards' },
            description: { type: 'string', nullable: true },
            categoryId: { type: 'string', format: 'uuid' },
            unit: { type: 'string', example: 'per 100', nullable: true },
            price: { type: 'number', format: 'float', example: 5000 },
            stock: { type: 'integer', example: 100 },
            minStock: { type: 'integer', example: 10 },
            status: { type: 'string', enum: ['in-stock', 'low-stock', 'out-of-stock'], example: 'in-stock' },
            saleStatus: { type: 'string', enum: ['pending', 'sold'], example: 'pending' },
            isActive: { type: 'boolean' },
            category: { $ref: '#/components/schemas/BoutiqueCategory' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BoutiqueStockMovement: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            changedById: { type: 'string', format: 'uuid' },
            change: { type: 'integer', example: 50, description: 'Positive = restock, negative = sale/use' },
            reason: { type: 'string', example: 'restock' },
            stockBefore: { type: 'integer', example: 50 },
            stockAfter: { type: 'integer', example: 100 },
            changedBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateBoutiqueCategoryRequest: {
          type: 'object',
          required: ['name', 'skuPrefix'],
          properties: {
            name: { type: 'string', example: 'Printing' },
            skuPrefix: { type: 'string', example: 'PRN' },
            colorClass: { type: 'string', example: 'bg-blue-100' },
          },
        },
        CreateBoutiqueProductRequest: {
          type: 'object',
          required: ['name', 'categoryId', 'price'],
          properties: {
            name: { type: 'string', example: 'Business Cards' },
            description: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            unit: { type: 'string', example: 'per 100' },
            price: { type: 'number', format: 'float', minimum: 0, example: 5000 },
            stock: { type: 'integer', minimum: 0, example: 100 },
            minStock: { type: 'integer', minimum: 0, example: 10 },
          },
        },
        UpdateStockRequest: {
          type: 'object',
          required: ['change', 'reason'],
          properties: {
            change: { type: 'integer', example: 50, description: 'Positive = restock, negative = sale/use' },
            reason: { type: 'string', example: 'restock' },
          },
        },
        // ── Employee ──────────────────────────────────────────────────────────
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string', example: 'Jane Uwase' },
            phoneNumber: { type: 'string', example: '+250788000001' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
            dateOfBirth: { type: 'string', format: 'date', example: '1995-06-15' },
            nid: { type: 'string', nullable: true, example: '1199580012345678' },
            address: { type: 'string', example: 'KG 45 St, Kigali' },
            email: { type: 'string', format: 'email', nullable: true },
            supportContact: { type: 'string', nullable: true, example: '+250788000002' },
            bankAccount: { type: 'string', nullable: true, example: '000-1234567-01' },
            contractSalary: { type: 'number', format: 'float', example: 250000 },
            contractType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], example: 'FULL_TIME' },
            hiredAt: { type: 'string', format: 'date', nullable: true, example: '2023-01-10' },
            isActive: { type: 'boolean', example: true },
            departmentId: { type: 'string', format: 'uuid', nullable: true },
            department: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string', example: 'Printing' },
              },
            },
            assignedJobs: {
              type: 'array',
              description: 'All jobs currently assigned to this employee',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  jobNumber: { type: 'string', example: 'JOB-2026-001' },
                  title: { type: 'string', example: 'Business Cards' },
                  state: { type: 'string', nullable: true, example: 'in-composition' },
                  status: { type: 'string', example: 'confirmed' },
                  priority: { type: 'string', example: 'normal' },
                  employee_job_assignment: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      assignedAt: { type: 'string', format: 'date-time' },
                      assignedById: { type: 'string', format: 'uuid', nullable: true },
                    },
                  },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateEmployeeRequest: {
          type: 'object',
          required: ['fullName', 'phoneNumber', 'gender', 'dateOfBirth', 'address', 'contractSalary'],
          properties: {
            fullName: { type: 'string', example: 'Jane Uwase' },
            phoneNumber: { type: 'string', example: '+250788000001' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'FEMALE' },
            dateOfBirth: { type: 'string', format: 'date', example: '1995-06-15' },
            address: { type: 'string', example: 'KG 45 St, Kigali' },
            contractSalary: { type: 'number', format: 'float', minimum: 0, example: 250000 },
            contractType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], example: 'FULL_TIME' },
            nid: { type: 'string', nullable: true, example: '1199580012345678' },
            email: { type: 'string', format: 'email', nullable: true, example: 'jane@example.com' },
            supportContact: { type: 'string', nullable: true, example: '+250788000002' },
            bankAccount: { type: 'string', nullable: true, example: '000-1234567-01' },
            hiredAt: { type: 'string', format: 'date', nullable: true, example: '2023-01-10' },
            departmentId: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        UpdateEmployeeRequest: {
          type: 'object',
          properties: {
            fullName: { type: 'string', example: 'Jane Uwase' },
            phoneNumber: { type: 'string', example: '+250788000001' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
            dateOfBirth: { type: 'string', format: 'date' },
            address: { type: 'string' },
            contractSalary: { type: 'number', format: 'float', minimum: 0 },
            contractType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] },
            nid: { type: 'string', nullable: true },
            email: { type: 'string', format: 'email', nullable: true },
            supportContact: { type: 'string', nullable: true },
            bankAccount: { type: 'string', nullable: true },
            hiredAt: { type: 'string', format: 'date', nullable: true },
            departmentId: { type: 'string', format: 'uuid', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        AssignEmployeeJobRequest: {
          type: 'object',
          properties: {
            jobId: { type: 'string', format: 'uuid', nullable: true, example: 'a1b2c3d4-...', description: 'Job UUID to assign, or null to remove assignment' },
          },
        },
        // ── Job Assignment ────────────────────────────────────────────────────
        AssignJobToEmployeeRequest: {
          type: 'object',
          required: ['jobId', 'employeeId'],
          properties: {
            jobId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            employeeId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-...' },
          },
        },
        // ── Invoice ──────────────────────────────────────────────────────────
        InvoiceLineItem: {
          type: 'object',
          required: ['name', 'quantity', 'unitPrice'],
          properties: {
            name: { type: 'string', example: 'Business Cards printing' },
            description: { type: 'string', nullable: true, example: '500 double-sided cards' },
            quantity: { type: 'number', format: 'float', minimum: 0.01, example: 500 },
            unitPrice: { type: 'number', format: 'float', minimum: 0, example: 0.30 },
            totalPrice: { type: 'number', format: 'float', example: 150.00, description: 'Computed: quantity × unitPrice' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            invoiceNo: { type: 'string', example: 'INV-2026-001' },
            jobId: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            createdById: { type: 'string', format: 'uuid' },
            lineItems: { type: 'array', items: { $ref: '#/components/schemas/InvoiceLineItem' } },
            subtotal: { type: 'number', format: 'float', example: 150000 },
            discountType: { type: 'string', enum: ['FIXED', 'PERCENTAGE'], nullable: true, example: 'PERCENTAGE' },
            discountValue: { type: 'number', format: 'float', example: 10, description: 'Amount or percentage depending on discountType' },
            discountAmount: { type: 'number', format: 'float', example: 15000, description: 'Computed discount in currency' },
            taxRate: { type: 'number', format: 'float', example: 18, description: 'Tax percentage e.g. 18 for 18%' },
            taxAmount: { type: 'number', format: 'float', example: 24300, description: 'Computed tax amount' },
            totalAmount: { type: 'number', format: 'float', example: 159300, description: 'Final amount: subtotal - discountAmount + taxAmount' },
            status: { type: 'string', enum: ['draft', 'issued', 'paid', 'cancelled'], example: 'draft' },
            issuedAt: { type: 'string', format: 'date-time', nullable: true },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            terms: { type: 'string', nullable: true },
            job: { $ref: '#/components/schemas/Job' },
            customer: { $ref: '#/components/schemas/Customer' },
            createdBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateInvoiceRequest: {
          type: 'object',
          required: ['jobId', 'customerId', 'lineItems'],
          properties: {
            jobId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            customerId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            lineItems: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/InvoiceLineItem' },
            },
            discountType: { type: 'string', enum: ['FIXED', 'PERCENTAGE'], nullable: true, example: 'PERCENTAGE' },
            discountValue: { type: 'number', format: 'float', minimum: 0, example: 10 },
            taxRate: { type: 'number', format: 'float', minimum: 0, example: 18 },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            terms: { type: 'string', nullable: true },
          },
        },
        UpdateInvoiceRequest: {
          type: 'object',
          properties: {
            lineItems: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/InvoiceLineItem' } },
            discountType: { type: 'string', enum: ['FIXED', 'PERCENTAGE'], nullable: true },
            discountValue: { type: 'number', format: 'float', minimum: 0 },
            taxRate: { type: 'number', format: 'float', minimum: 0 },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            terms: { type: 'string', nullable: true },
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
      { name: 'Boutique', description: 'Boutique product and stock management' },
      { name: 'Stock', description: 'Internal stock/inventory management' },
      { name: 'Quotations', description: 'Quotation management' },
      { name: 'Visits', description: 'Customer visit check-in/check-out tracking' },
      { name: 'Permissions', description: 'Role-based permission management' },
      { name: 'Roles', description: 'Dynamic role management' },
      { name: 'Invoices', description: 'Invoice generation and lifecycle management' },
      { name: 'Employees', description: 'Employee management' },
      { name: 'Job Assignments', description: 'Supervisor assigns jobs to department employees' },
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
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', format: 'uuid' },
                                  name: { type: 'string' },
                                  email: { type: 'string', format: 'email' },
                                  role: { type: 'string' },
                                  departmentId: { type: 'string', format: 'uuid', nullable: true },
                                },
                              },
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
            { in: 'query', name: 'departmentId', schema: { type: 'string', format: 'uuid' }, description: 'Filter by department' },
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
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending','confirmed','rejected','delivered','completed'] } },
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
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending','confirmed','rejected','delivered','completed'] } },
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
          summary: 'Update job details (ADMIN, RECEPTIONIST, SALES, PRODUCTION_MANAGER)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateJobRequest' } } } },
          responses: {
            200: { description: 'Job updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Job' } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Jobs'],
          summary: 'Delete a job — ADMIN, SALES, RECEPTIONIST (only pending or confirmed jobs)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Job deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job cannot be deleted in its current status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/approve': {
        post: {
          tags: ['Jobs'],
          summary: 'Approve a job — transitions pending → confirmed (ADMIN, SUPERVISOR, PRODUCTION_MANAGER, DAF)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Job approved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, status: { type: 'string', example: 'confirmed' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job is not in pending status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/reject': {
        post: {
          tags: ['Jobs'],
          summary: 'Reject a job — transitions pending/confirmed → rejected (ADMIN, SUPERVISOR, PRODUCTION_MANAGER, DAF)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: false,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RejectJobRequest' } } },
          },
          responses: {
            200: {
              description: 'Job rejected successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, status: { type: 'string', example: 'rejected' }, rejectReason: { type: 'string', nullable: true } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job cannot be rejected from its current status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/state': {
        patch: {
          tags: ['Jobs'],
          summary: 'Update job production state — supervisor marks department work done (ADMIN, SUPERVISOR)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['state'],
                  properties: {
                    state: {
                      type: 'string',
                      enum: [
                        'composition-done', 'montage-done', 'printing-done',
                        'binding-done', 'packaging-done', 'qualitycheck-done',
                      ],
                      example: 'printing-done',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Job state updated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, state: { type: 'string' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Invalid state transition', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
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
      '/api/jobs/{id}/reassign': {
        patch: {
          tags: ['Jobs'],
          summary: 'Reassign a job to a different department (ADMIN, SUPERVISOR, SALES, PRODUCTION_MANAGER)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['departmentAssignedToId'],
                  properties: {
                    departmentAssignedToId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...', description: 'ID of the new department to reassign this job to' },
                    reason: { type: 'string', nullable: true, example: 'Department overloaded', description: 'Optional reason for reassignment' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Job reassigned successfully',
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
                              id: { type: 'string', format: 'uuid' },
                              jobNumber: { type: 'string' },
                              previousDepartment: { type: 'object', nullable: true, properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' } } },
                              departmentAssignedTo: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' } } },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job or department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Job is already assigned to this department', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Job has no current department assignment', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{id}/assign': {
        post: {
          tags: ['Jobs'],
          summary: 'Assign a job to a department (ADMIN, SUPERVISOR, SALES, PRODUCTION_MANAGER)',
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
          summary: 'Mark a job as delivered — ADMIN, RECEPTIONIST, SUPERVISOR, SALES, PRODUCTION_MANAGER',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    deliveredByName: { type: 'string', example: 'John Doe', description: 'Name of person who received the delivery' },
                    deliveredByContact: { type: 'string', example: '+250788000001', description: 'Contact of person who received the delivery' },
                  },
                },
              },
            },
          },
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
          summary: 'Mark a job as completed — ADMIN, RECEPTIONIST, SUPERVISOR, SALES, PRODUCTION_MANAGER',
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
      // ── Roles ──────────────────────────────────────────────────────────────
      '/api/roles': {
        get: {
          tags: ['Roles'],
          summary: 'Get all roles',
          responses: {
            200: { description: 'List of all roles', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Role' } } } }] } } } },
          },
        },
        post: {
          tags: ['Roles'],
          summary: 'Create a new role (ADMIN only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'DESIGNER' },
                    description: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Role created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Role' } } }] } } } },
            409: { description: 'Role already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/roles/{id}': {
        get: {
          tags: ['Roles'],
          summary: 'Get a role by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Role data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Role' } } }] } } } },
            404: { description: 'Role not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Roles'],
          summary: 'Update a role (ADMIN only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', description: 'Cannot change name of system roles' }, description: { type: 'string' }, isActive: { type: 'boolean' } } } } } },
          responses: {
            200: { description: 'Role updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Role' } } }] } } } },
            404: { description: 'Role not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Role name already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Cannot rename system role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        patch: {
          tags: ['Roles'],
          summary: 'Update a role (ADMIN only) — same as PUT',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', description: 'Cannot change name of system roles' }, description: { type: 'string' }, isActive: { type: 'boolean' } } } } } },
          responses: {
            200: { description: 'Role updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Role' } } }] } } } },
            404: { description: 'Role not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Role name already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Cannot rename system role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Roles'],
          summary: 'Delete a role (ADMIN only) — cannot delete system roles or roles in use',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Role deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Role not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Cannot delete system role or role in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Permissions ────────────────────────────────────────────────────────
      '/api/permissions': {
        get: {
          tags: ['Permissions'],
          summary: 'Get all permissions',
          responses: {
            200: { description: 'List of all permissions', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Permission' } } } }] } } } },
          },
        },
        post: {
          tags: ['Permissions'],
          summary: 'Create a new permission (ADMIN only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['resource', 'action'],
                  properties: {
                    resource: { type: 'string', example: 'jobs' },
                    action: { type: 'string', example: 'create' },
                    description: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Permission created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Permission' } } }] } } } },
            409: { description: 'Permission already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/permissions/{id}': {
        put: {
          tags: ['Permissions'],
          summary: 'Update a permission description (ADMIN only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { description: { type: 'string' } } } } } },
          responses: {
            200: { description: 'Permission updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Permission' } } }] } } } },
            404: { description: 'Permission not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Permissions'],
          summary: 'Delete a permission (ADMIN only) — also removes from all roles',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Permission deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Permission not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/permissions/my': {
        get: {
          tags: ['Permissions'],
          summary: 'Get permissions for the current authenticated user',
          responses: {
            200: { description: 'Current user role permissions', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'object', properties: { role: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } } } } }] } } } },
          },
        },
      },
      '/api/permissions/role/{role}': {
        get: {
          tags: ['Permissions'],
          summary: 'Get all permissions for a specific role',
          parameters: [{ in: 'path', name: 'role', required: true, schema: { type: 'string', enum: ['ADMIN', 'RECEPTIONIST', 'SALES', 'DAF', 'ACCOUNTANT', 'PRODUCTION_MANAGER', 'STOCK', 'SUPERVISOR', 'WORKER'] } }],
          responses: {
            200: { description: 'Role permissions', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'object', properties: { role: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } } } } }] } } } },
            400: { description: 'Invalid role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Permissions'],
          summary: 'Grant a permission to a role (ADMIN only)',
          parameters: [{ in: 'path', name: 'role', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['permissionId'], properties: { permissionId: { type: 'string', format: 'uuid' } } } } } },
          responses: {
            201: { description: 'Permission granted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Permission not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Role already has this permission', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Permissions'],
          summary: 'Replace all permissions for a role (ADMIN only)',
          parameters: [{ in: 'path', name: 'role', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['permissionIds'], properties: { permissionIds: { type: 'array', items: { type: 'string', format: 'uuid' } } } } } } },
          responses: {
            200: { description: 'Role permissions updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Invalid permission IDs', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/permissions/role/{role}/{permissionId}': {
        delete: {
          tags: ['Permissions'],
          summary: 'Revoke a permission from a role (ADMIN only)',
          parameters: [
            { in: 'path', name: 'role', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'permissionId', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Permission revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Permission not found for role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Visits ─────────────────────────────────────────────────────────────
      '/api/visits': {
        get: {
          tags: ['Visits'],
          summary: 'Get all customer visits (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'customerId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['IN', 'OUT'] } },
            { in: 'query', name: 'date', schema: { type: 'string', format: 'date' }, description: 'Filter by date e.g. 2026-05-20' },
          ],
          responses: {
            200: { description: 'Paginated list of visits', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/CustomerVisit' } } } }] } } } },
          },
        },
      },
      '/api/visits/checkin': {
        post: {
          tags: ['Visits'],
          summary: 'Check in a customer (ADMIN, RECEPTIONIST)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customerId'],
                  properties: {
                    customerId: { type: 'string', format: 'uuid' },
                    purpose: { type: 'string', example: 'Job pickup', nullable: true },
                    notes: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Customer checked in', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/CustomerVisit' } } }] } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/visits/customer/{customerId}': {
        get: {
          tags: ['Visits'],
          summary: 'Get all visits for a specific customer',
          parameters: [
            { in: 'path', name: 'customerId', required: true, schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Paginated visits for customer', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/CustomerVisit' } } } }] } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/visits/{id}': {
        get: {
          tags: ['Visits'],
          summary: 'Get a visit by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Visit data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/CustomerVisit' } } }] } } } },
            404: { description: 'Visit not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Visits'],
          summary: 'Delete a visit record (ADMIN only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Visit deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Visit not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/visits/{id}/checkout': {
        patch: {
          tags: ['Visits'],
          summary: 'Check out a customer (ADMIN, RECEPTIONIST)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Customer checked out', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/CustomerVisit' } } }] } } } },
            404: { description: 'Visit not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Already checked out', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Quotations ─────────────────────────────────────────────────────────
      '/api/quotations': {
        get: {
          tags: ['Quotations'],
          summary: 'Get all quotations (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'] } },
            { in: 'query', name: 'customerId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by quotation number' },
          ],
          responses: {
            200: { description: 'Paginated list of quotations', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Quotation' } } } }] } } } },
          },
        },
        post: {
          tags: ['Quotations'],
          summary: 'Create a quotation (ADMIN, RECEPTIONIST, SALES)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jobId'],
                  properties: {
                    jobId: { type: 'string', format: 'uuid' },
                    subtotal: { type: 'number', format: 'float', example: 150000 },
                    taxRate: { type: 'number', format: 'float', example: 18, description: 'Tax percentage' },
                    discount: { type: 'number', format: 'float', example: 0 },
                    validUntil: { type: 'string', format: 'date-time' },
                    notes: { type: 'string' },
                    terms: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Quotation created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Quotation' } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/quotations/job/{jobId}': {
        get: {
          tags: ['Quotations'],
          summary: 'Get all quotations for a specific job',
          parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'List of quotations for the job', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Quotation' } } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/quotations/{id}': {
        get: {
          tags: ['Quotations'],
          summary: 'Get a quotation by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Quotation data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Quotation' } } }] } } } },
            404: { description: 'Quotation not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Quotations'],
          summary: 'Update a quotation (only draft, ADMIN, RECEPTIONIST, SALES)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { subtotal: { type: 'number' }, taxRate: { type: 'number' }, discount: { type: 'number' }, validUntil: { type: 'string', format: 'date-time' }, notes: { type: 'string' }, terms: { type: 'string' } } } } } },
          responses: {
            200: { description: 'Quotation updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Quotation' } } }] } } } },
            404: { description: 'Quotation not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Cannot edit non-draft quotation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Quotations'],
          summary: 'Delete a quotation (only draft, ADMIN, RECEPTIONIST)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Quotation deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Quotation not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Cannot delete non-draft quotation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/quotations/{id}/status': {
        patch: {
          tags: ['Quotations'],
          summary: 'Update quotation status (ADMIN, RECEPTIONIST, SALES)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'] } } } } } },
          responses: {
            200: { description: 'Status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Quotation not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Job Items ──────────────────────────────────────────────────────────
      '/api/jobs/{jobId}/items': {
        get: {
          tags: ['Jobs'],
          summary: 'Get all stock items linked to a job',
          parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'List of job items', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/JobItem' } } } }] } } } },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Jobs'],
          summary: 'Add a stock item to a job (ADMIN, RECEPTIONIST, SALES)',
          parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['stockItemId', 'quantityNeeded'],
                  properties: {
                    stockItemId: { type: 'string', format: 'uuid' },
                    quantityNeeded: { type: 'number', minimum: 0.01, example: 5 },
                    notes: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Item added to job', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/JobItem' } } }] } } } },
            404: { description: 'Job or stock item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Item already added to job', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/jobs/{jobId}/items/{id}': {
        put: {
          tags: ['Jobs'],
          summary: 'Update a job item (ADMIN, RECEPTIONIST, SALES, SUPERVISOR)',
          parameters: [
            { in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } },
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    quantityNeeded: { type: 'number', minimum: 0.01 },
                    quantityUsed: { type: 'number', minimum: 0 },
                    notes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Job item updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/JobItem' } } }] } } } },
            404: { description: 'Job item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Jobs'],
          summary: 'Remove a stock item from a job (ADMIN, RECEPTIONIST, SALES)',
          parameters: [
            { in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } },
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Item removed from job', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Job item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Stock ──────────────────────────────────────────────────────────────
      '/api/stock/items': {
        get: {
          tags: ['Stock'],
          summary: 'Get all stock items (paginated)',
          description: 'HOBE role users automatically see only items with type=hobe. Other roles can filter by type explicitly.',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'category', schema: { type: 'string' } },
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['boutique', 'hobe', 'general'] }, description: 'Filter by stock item type. HOBE role always defaults to hobe.' },
            { in: 'query', name: 'stockStatus', schema: { type: 'string', enum: ['in-stock', 'low-stock', 'out-of-stock'] } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Paginated list of stock items', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/StockItem' } } } }] } } } },
          },
        },
        post: {
          tags: ['Stock'],
          summary: 'Create a stock item (ADMIN, STOCK)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStockItemRequest' } } } },
          responses: {
            201: { description: 'Stock item created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockItem' } } }] } } } },
          },
        },
      },
      '/api/stock/items/{id}': {
        get: {
          tags: ['Stock'],
          summary: 'Get a stock item by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Stock item data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockItem' } } }] } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Stock'],
          summary: 'Update a stock item (ADMIN, STOCK)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateStockItemRequest' } } } },
          responses: {
            200: { description: 'Stock item updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockItem' } } }] } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Stock'],
          summary: 'Delete a stock item (ADMIN, soft delete)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Stock item deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/stock/entries': {
        get: {
          tags: ['Stock'],
          summary: 'Get all stock entries (IN)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'stockItemId', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Paginated list of stock entries', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/StockEntry' } } } }] } } } },
          },
        },
        post: {
          tags: ['Stock'],
          summary: 'Record a stock entry / restock (ADMIN, STOCK)',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['stockItemId', 'quantityIn'], properties: { stockItemId: { type: 'string', format: 'uuid' }, quantityIn: { type: 'number', minimum: 0.01 }, unitCost: { type: 'number' }, supplier: { type: 'string' }, referenceNo: { type: 'string' }, notes: { type: 'string' }, entryDate: { type: 'string', format: 'date-time' } } } } } },
          responses: {
            201: { description: 'Stock entry recorded', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockEntry' } } }] } } } },
            404: { description: 'Stock item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/stock/sorties': {
        get: {
          tags: ['Stock'],
          summary: 'Get all stock sorties (OUT)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'stockItemId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
            { in: 'query', name: 'jobId', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Paginated list of stock sorties', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/StockSortie' } } } }] } } } },
          },
        },
        post: {
          tags: ['Stock'],
          summary: 'Request a stock sortie / stock out (ADMIN, STOCK, SUPERVISOR, PRODUCTION_MANAGER, RECEPTIONIST)',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['stockItemId', 'quantityOut'], properties: { stockItemId: { type: 'string', format: 'uuid' }, quantityOut: { type: 'number', minimum: 0.01 }, jobId: { type: 'string', format: 'uuid' }, dossierNo: { type: 'string' }, reason: { type: 'string' }, notes: { type: 'string' }, sortieDate: { type: 'string', format: 'date-time' } } } } } },
          responses: {
            201: { description: 'Sortie request created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockSortie' } } }] } } } },
            403: { description: 'HOBE users can only request hobe-type stock items', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Stock item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Insufficient stock', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/stock/sorties/{id}/approve': {
        patch: {
          tags: ['Stock'],
          summary: 'Approve a stock sortie (ADMIN, STOCK)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Sortie approved', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockSortie' } } }] } } } },
            404: { description: 'Sortie not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Already approved or rejected', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Insufficient stock', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/stock/sorties/{id}/reject': {
        patch: {
          tags: ['Stock'],
          summary: 'Reject a stock sortie (ADMIN, STOCK)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Sortie rejected', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/StockSortie' } } }] } } } },
            404: { description: 'Sortie not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Already approved or rejected', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Boutique ───────────────────────────────────────────────────────────
      '/api/boutique/categories': {
        get: {
          tags: ['Boutique'],
          summary: 'Get all active boutique categories',
          responses: {
            200: { description: 'List of categories', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/BoutiqueCategory' } } } }] } } } },
          },
        },
        post: {
          tags: ['Boutique'],
          summary: 'Create a boutique category (ADMIN)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBoutiqueCategoryRequest' } } } },
          responses: {
            201: { description: 'Category created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueCategory' } } }] } } } },
            409: { description: 'Category already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/boutique/categories/{id}': {
        put: {
          tags: ['Boutique'],
          summary: 'Update a boutique category (ADMIN)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, skuPrefix: { type: 'string' }, colorClass: { type: 'string' }, isActive: { type: 'boolean' } } } } } },
          responses: {
            200: { description: 'Category updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueCategory' } } }] } } } },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Boutique'],
          summary: 'Delete a boutique category (ADMIN, soft delete)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Category deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/boutique/products': {
        get: {
          tags: ['Boutique'],
          summary: 'Get all boutique products (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'categoryId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['in-stock', 'low-stock', 'out-of-stock'] } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name, SKU or description' },
          ],
          responses: {
            200: { description: 'Paginated list of products', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/BoutiqueProduct' } } } }] } } } },
          },
        },
        post: {
          tags: ['Boutique'],
          summary: 'Create a boutique product (ADMIN, STOCK, RECEPTIONIST)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBoutiqueProductRequest' } } } },
          responses: {
            201: { description: 'Product created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueProduct' } } }] } } } },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/boutique/products/{id}': {
        get: {
          tags: ['Boutique'],
          summary: 'Get a boutique product by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Product data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueProduct' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Boutique'],
          summary: 'Update a boutique product (ADMIN, STOCK)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, unit: { type: 'string' }, price: { type: 'number' }, minStock: { type: 'integer' }, isActive: { type: 'boolean' } } } } } },
          responses: {
            200: { description: 'Product updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueProduct' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Boutique'],
          summary: 'Delete a boutique product (ADMIN, soft delete)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Product deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/boutique/products/{id}/sale-status': {
        patch: {
          tags: ['Boutique'],
          summary: 'Sell a quantity of a boutique product — deducts stock, sets saleStatus to sold when stock reaches 0 (ADMIN, STOCK, RECEPTIONIST)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['amountPaid'],
                  properties: {
                    quantity:      { type: 'integer', minimum: 1, example: 2, description: 'Number of units sold (defaults to 1)' },
                    qty:           { type: 'integer', minimum: 1, example: 2, description: 'Alias for quantity' },
                    amountPaid:    { type: 'number', minimum: 0, example: 42000, description: 'Amount the customer paid' },
                    unitPrice:     { type: 'number', minimum: 0, example: 2000, description: 'Override unit price (defaults to product price)' },
                    paymentMethod: { type: 'string', enum: ['cash', 'mobile', 'card', 'bank'], example: 'cash' },
                    customerId:    { type: 'string', format: 'uuid', description: 'Existing customer UUID (optional)' },
                    customerName:  { type: 'string', example: 'muneza', description: 'Customer name — used to find-or-create customer' },
                    customerPhone: { type: 'string', example: '+250526162626', description: 'Customer phone — used with customerName to find-or-create' },
                    note:          { type: 'string', example: 'cyaze', description: 'Sale note' },
                    notes:         { type: 'string', example: 'cyaze', description: 'Alias for note' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Sale recorded', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueProduct' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Insufficient stock or invalid quantity', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/boutique/products/{id}/stock': {
        patch: {
          tags: ['Boutique'],
          summary: 'Update product stock (ADMIN, STOCK)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateStockRequest' } } } },
          responses: {
            200: { description: 'Stock updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/BoutiqueProduct' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Insufficient stock', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/boutique/products/{id}/stock-movements': {
        get: {
          tags: ['Boutique'],
          summary: 'Get stock movement history for a product',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Paginated stock movements', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/BoutiqueStockMovement' } } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Job Assignments ────────────────────────────────────────────────────
      '/api/job-assignments/assign': {
        post: {
          tags: ['Job Assignments'],
          summary: 'Assign a job to an employee in the same department (ADMIN, SUPERVISOR)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignJobToEmployeeRequest' } } },
          },
          responses: {
            200: {
              description: 'Job assigned to employee successfully',
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
                              employee: { $ref: '#/components/schemas/User' },
                              replacedJobId: { type: 'string', format: 'uuid', nullable: true },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job or employee not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Employee not in job department or job not assigned to department', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/job-assignments/unassign/{employeeId}': {
        delete: {
          tags: ['Job Assignments'],
          summary: 'Remove current job assignment from an employee (ADMIN, SUPERVISOR)',
          parameters: [{ in: 'path', name: 'employeeId', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Job unassigned from employee',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { employeeId: { type: 'string', format: 'uuid' }, unassignedJobId: { type: 'string', format: 'uuid' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Employee not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Employee has no job assigned', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/job-assignments/employees/{departmentId}': {
        get: {
          tags: ['Job Assignments'],
          summary: 'Get all employees in a department with their current job assignment (ADMIN, SUPERVISOR)',
          parameters: [{ in: 'path', name: 'departmentId', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'List of employees with their current job',
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
                              department: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' } } },
                              employees: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/job-assignments/job/{jobId}/employees': {
        get: {
          tags: ['Job Assignments'],
          summary: 'Get all employees currently assigned to a specific job (ADMIN, SUPERVISOR)',
          parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'List of employees assigned to the job',
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
                              job: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, jobNumber: { type: 'string' }, title: { type: 'string' }, state: { type: 'string' }, status: { type: 'string' } } },
                              employees: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Sheets ────────────────────────────────────────────────────────────
      '/api/sheets': {
        get: {
          tags: ['Sheets'],
          summary: 'List all sheets (paginated)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name or description' },
          ],
          responses: {
            200: { description: 'Paginated sheets', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          },
        },
        post: {
          tags: ['Sheets'],
          summary: 'Create a sheet (ADMIN, RECEPTIONIST, SALES, STOCK, DAF)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'qty', 'unitPrice'],
                  properties: {
                    name:          { type: 'string', example: 'sheets' },
                    description:   { type: 'string', example: 'this is done well' },
                    qty:           { type: 'integer', minimum: 0, example: 20 },
                    unitPrice:     { type: 'number', minimum: 0, example: 1000 },
                    customerName:  { type: 'string', example: 'hooora' },
                    customerPhone: { type: 'string', example: '+250782929292' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Sheet created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/sheets/{id}': {
        get: {
          tags: ['Sheets'],
          summary: 'Get a sheet by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Sheet data', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Sheet not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Sheets'],
          summary: 'Update a sheet (ADMIN, RECEPTIONIST, SALES, STOCK, DAF)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name:          { type: 'string', example: 'sheets' },
                    description:   { type: 'string', example: 'this is done well' },
                    qty:           { type: 'integer', minimum: 0, example: 20 },
                    unitPrice:     { type: 'number', minimum: 0, example: 1000 },
                    customerName:  { type: 'string', example: 'hooora' },
                    customerPhone: { type: 'string', example: '+250782929292' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Sheet updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Sheet not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Sheets'],
          summary: 'Delete a sheet (ADMIN, DAF, RECEPTIONIST)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Sheet deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Sheet not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Invoices ───────────────────────────────────────────────────────────
      '/api/invoices/next-number': {
        get: {
          tags: ['Invoices'],
          summary: 'Preview the next auto-generated invoice number',
          responses: {
            200: {
              description: 'Next invoice number',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { invoiceNo: { type: 'string', example: 'INV-2026-001' } } } } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/invoices/number/{invoiceNo}': {
        get: {
          tags: ['Invoices'],
          summary: 'Get an invoice by its invoice number (e.g. INV-2026-001)',
          parameters: [
            { in: 'path', name: 'invoiceNo', required: true, schema: { type: 'string' }, example: 'INV-2026-001' },
          ],
          responses: {
            200: { description: 'Invoice data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Invoice' } } }] } } } },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/invoices': {
        get: {
          tags: ['Invoices'],
          summary: 'Get all invoices (paginated, filterable)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['draft', 'issued', 'paid', 'cancelled'] } },
            { in: 'query', name: 'customerId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'jobId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by invoice number' },
          ],
          responses: {
            200: { description: 'Paginated list of invoices', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Invoice' } } } }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Invoices'],
          summary: 'Create a new invoice for a job (ADMIN, RECEPTIONIST, SALES, ACCOUNTANT)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateInvoiceRequest' } } },
          },
          responses: {
            201: { description: 'Invoice created successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Invoice' } } }] } } } },
            404: { description: 'Job or customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/invoices/{id}': {
        get: {
          tags: ['Invoices'],
          summary: 'Get an invoice by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Invoice data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Invoice' } } }] } } } },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Invoices'],
          summary: 'Update a draft invoice (ADMIN, RECEPTIONIST, SALES, ACCOUNTANT)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateInvoiceRequest' } } } },
          responses: {
            200: { description: 'Invoice updated successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Invoice' } } }] } } } },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Only draft invoices can be edited', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Invoices'],
          summary: 'Delete a draft invoice (ADMIN, ACCOUNTANT)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Invoice deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Only draft invoices can be deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/invoices/{id}/issue': {
        patch: {
          tags: ['Invoices'],
          summary: 'Issue a draft invoice — marks it as sent to client (ADMIN, RECEPTIONIST, SALES, ACCOUNTANT)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Invoice issued successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, invoiceNo: { type: 'string' }, status: { type: 'string', example: 'issued' }, issuedAt: { type: 'string', format: 'date-time' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Only draft invoices can be issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/invoices/{id}/mark-paid': {
        patch: {
          tags: ['Invoices'],
          summary: 'Mark an issued invoice as paid (ADMIN, ACCOUNTANT, DAF)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Invoice marked as paid',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, invoiceNo: { type: 'string' }, status: { type: 'string', example: 'paid' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Only issued invoices can be marked as paid', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/invoices/{id}/cancel': {
        patch: {
          tags: ['Invoices'],
          summary: 'Cancel a draft or issued invoice (ADMIN, ACCOUNTANT)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Invoice cancelled',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, invoiceNo: { type: 'string' }, status: { type: 'string', example: 'cancelled' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Invoice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Cannot cancel a paid invoice', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
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
      '/api/notifications/{id}': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark a single notification as read',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Notification marked as read', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Notification' } } }] } } } },
            404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
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
      // ── Employees ─────────────────────────────────────────────────────────
      '/api/employees': {
        get: {
          tags: ['Employees'],
          summary: 'List all employees (paginated). SUPERVISORs are automatically scoped to their own department.',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'departmentId', schema: { type: 'string', format: 'uuid' }, description: 'Filter by department (ignored for SUPERVISOR — their department is applied automatically)' },
            { in: 'query', name: 'isActive', schema: { type: 'boolean' }, description: 'Filter by active status' },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name, phone, or email' },
          ],
          responses: {
            200: {
              description: 'Paginated list of employees',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Employee' } } } },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Employees'],
          summary: 'Create a new employee (ADMIN, HR)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEmployeeRequest' } } },
          },
          responses: {
            201: { description: 'Employee created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
            404: { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/employees/{id}': {
        get: {
          tags: ['Employees'],
          summary: 'Get a single employee by ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Employee details', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
            404: { description: 'Employee not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Employees'],
          summary: 'Update an employee (ADMIN, HR)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateEmployeeRequest' } } },
          },
          responses: {
            200: { description: 'Employee updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
            404: { description: 'Employee or department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Employees'],
          summary: 'Delete an employee (ADMIN)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Employee deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Employee not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/employees/{id}/department': {
        patch: {
          tags: ['Employees'],
          summary: 'Assign or remove department from an employee (ADMIN, HR)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    departmentId: { type: 'string', format: 'uuid', nullable: true, description: 'Department UUID to assign, or null to remove' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Department assigned/removed', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
            404: { description: 'Employee or department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/employees/{id}/assign-job': {
        patch: {
          tags: ['Employees'],
          summary: 'Assign a job to an employee (ADMIN, HR, SUPERVISOR). A job can only be assigned once per employee.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignEmployeeJobRequest' } } },
          },
          responses: {
            200: { description: 'Job assigned successfully', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
            404: { description: 'Employee or job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Job already assigned to this employee', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Employee not in job\'s assigned department', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/employees/{id}/unassign-job': {
        patch: {
          tags: ['Employees'],
          summary: 'Remove a specific job from an employee\'s assignments (ADMIN, HR, SUPERVISOR)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignEmployeeJobRequest' } } },
          },
          responses: {
            200: { description: 'Job removed from employee', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/Employee' } } }] } } } },
            404: { description: 'Employee not found or job not assigned to this employee', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      // ── Material Requests ────────────────────────────────────────────────
      '/api/material-requests/my': {
        get: {
          tags: ['Material Requests'],
          summary: 'Get my material requests (WORKER, PRINTEMPLOYEE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
          ],
          responses: {
            200: { description: 'List of my material requests', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/MaterialRequest' } } } }] } } } },
          },
        },
      },
      '/api/material-requests': {
        get: {
          tags: ['Material Requests'],
          summary: 'Get all material requests (ADMIN, SUPERVISOR, STOCK_MANAGER, STOCK)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
            { in: 'query', name: 'jobId', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'List of all material requests', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/MaterialRequest' } } } }] } } } },
          },
        },
        post: {
          tags: ['Material Requests'],
          summary: 'Create a material request (WORKER, PRINTEMPLOYEE)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaterialRequestRequest' } } },
          },
          responses: {
            201: { description: 'Material request created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/MaterialRequest' } } }] } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/material-requests/{id}/approve': {
        patch: {
          tags: ['Material Requests'],
          summary: 'Approve a material request (ADMIN, SUPERVISOR, STOCK_MANAGER, STOCK)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: false,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RespondMaterialRequestRequest' } } },
          },
          responses: {
            200: { description: 'Request approved', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/MaterialRequest' } } }] } } } },
            404: { description: 'Request not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Already approved or rejected', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/material-requests/{id}/reject': {
        patch: {
          tags: ['Material Requests'],
          summary: 'Reject a material request (ADMIN, SUPERVISOR, STOCK_MANAGER, STOCK)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: false,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RespondMaterialRequestRequest' } } },
          },
          responses: {
            200: { description: 'Request rejected', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { data: { $ref: '#/components/schemas/MaterialRequest' } } }] } } } },
            404: { description: 'Request not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Already approved or rejected', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/employees/{id}/toggle-active': {
        patch: {
          tags: ['Employees'],
          summary: 'Toggle employee active/inactive status (ADMIN, HR)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Active status toggled',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, isActive: { type: 'boolean' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Employee not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

    },
  },
  apis: [], // all docs are defined inline above — no file scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
