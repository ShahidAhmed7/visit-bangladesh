const swaggerDoc = {
  openapi: "3.0.0",
  info: {
    title: "Visit Bangladesh API",
    version: "1.0.0",
    description: "Public and authenticated endpoints for Visit Bangladesh (auth, blogs, spots).",
  },
  servers: [{ url: "http://localhost:5000" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { 200: { description: "Service is up" } },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register (regular user)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["name", "email", "password"], properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
              } },
            },
          },
        },
        responses: {
          201: { description: "Registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["email", "password"], properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              } },
            },
          },
        },
        responses: { 200: { description: "Logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } } },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "User info", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } },
      },
    },
    "/api/spots": {
      get: {
        summary: "List tourist spots (public) with search, filters, sort and pagination",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Keyword search (name/description)" },
          { name: "categories", in: "query", schema: { type: "string" }, description: "Comma-separated categories e.g. 'Nature,Beach'" },
          { name: "division", in: "query", schema: { type: "string" } },
          { name: "district", in: "query", schema: { type: "string" } },
          { name: "minRating", in: "query", schema: { type: "number", minimum: 0, maximum: 5 } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["rating_desc", "newest", "most_reviewed"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
        ],
        responses: { 200: { description: "Array of spots with meta", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Spot" } }, meta: { type: "object" } } } } } } },
      },
    },
    "/api/spots/{id}": {
      get: {
        summary: "Get spot by id (public)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Spot", content: { "application/json": { schema: { $ref: "#/components/schemas/Spot" } } } } },
      },
    },
    "/api/blogs": {
      get: {
        summary: "List blogs (public)",
        responses: { 200: { description: "Array of blogs", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Blog" } } } } } },
      },
      post: {
        summary: "Create blog",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  images: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created blog", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
    },
    "/api/blogs/{id}": {
      get: {
        summary: "Get blog (public)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Blog", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
      put: {
        summary: "Update blog",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  images: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated blog", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
      delete: {
        summary: "Delete blog",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted blog" } },
      },
    },
    "/api/blogs/{id}/like": {
      post: {
        summary: "Like blog",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Blog with updated likes", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
    },
    "/api/blogs/{id}/unlike": {
      post: {
        summary: "Unlike blog",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Blog with updated likes", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
    },
    "/api/blogs/{id}/comment": {
      post: {
        summary: "Add comment",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } },
        },
        responses: { 201: { description: "Blog with new comment", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
    },
    "/api/blogs/{id}/comment/{commentId}": {
      delete: {
        summary: "Delete comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "commentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Blog with comment removed", content: { "application/json": { schema: { $ref: "#/components/schemas/Blog" } } } } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
      Spot: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          location: {
            type: "object",
            properties: {
              division: { type: "string" },
              district: { type: "string" },
              lat: { type: "number" },
              lng: { type: "number" },
            },
          },
          images: { type: "array", items: { type: "string" } },
          googleMapsUrl: { type: "string" },
          avgRating: { type: "number" },
          reviewCount: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Blog: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          author: { $ref: "#/components/schemas/User" },
          likes: { type: "array", items: { type: "string" } },
          comments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                text: { type: "string" },
                user: { $ref: "#/components/schemas/User" },
                createdAt: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDoc;
