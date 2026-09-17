# 🛡️ UrbanShield - Backend API

![UrbanShield Backend](https://placehold.co/1200x300/0f172a/ffffff?text=UrbanShield+API+Serverless)

> **UrbanShield** is a citizen platform designed for reporting urban incidents and emergencies. 
> This repository contains the **Backend API**, designed to be scalable, secure, and Serverless, built on Node.js and the AWS ecosystem.

---

## Tech Stack

- Node.js + Express.js (JavaScript)
- JWT authentication with role-based access control
- AWS SDK v3 (Cognito, S3, DynamoDB, SNS, Location Service)
- Joi validation, Helmet, CORS, rate limiting
- Swagger/OpenAPI documentation
- Lambda + API Gateway ready via `serverless-http`

## Quick Start

```bash
cd backend_urbanshield
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:3000/api`  
Docs: `http://localhost:3000/api-docs`

### Seed data

If you need initial users or sample reports, seed them directly in DynamoDB or through a one-off script that writes to the AWS tables. The API no longer depends on an in-memory fallback.

## Project Structure

```
src/
├── app.js              # Express application
├── server.js           # HTTP server entry
├── lambda.js           # AWS Lambda handler
├── config/             # Environment & AWS config
├── constants/          # Roles, statuses, categories
├── controllers/        # HTTP request handlers
├── routes/             # REST route definitions
├── middlewares/        # Auth, validation, errors
├── services/           # Business logic
├── repositories/       # Data access (DynamoDB)
├── models/             # Entity shapes
├── validators/         # Joi schemas
├── aws/                # AWS service abstractions
├── database/           # DynamoDB config and table definitions
├── errors/             # Custom error classes
├── utils/              # Helpers (JWT, geo, pagination)
└── docs/               # OpenAPI specification
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register citizen |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout (protected) |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Current user profile |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports (paginated) |
| POST | `/api/reports` | Create report |
| GET | `/api/reports/:id` | Report details |
| PATCH | `/api/reports/:id/status` | Update status (admin) |
| POST | `/api/reports/:id/resolve` | Resolve incident (admin) |
| GET | `/api/reports/nearby` | Nearby incidents |
| GET | `/api/reports/analytics` | Analytics (admin) |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads/presigned-url` | S3 presigned upload URL |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/location/search` | Place search (AWS Location) |
| GET | `/api/location/markers` | Map markers |
| GET | `/api/location/radius` | Radius search |
| GET | `/api/location/heatmap` | Heatmap data |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard analytics |
| GET | `/api/admin/monitoring` | Real-time monitoring |
| GET | `/api/admin/activity` | Activity feed |
| GET | `/api/admin/emergency-summary` | Emergency summary |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## Standard Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "errors": null
}
```

## AWS Deployment

1. Deploy the stack with `serverless.yml` so DynamoDB, S3, SNS and the Lambda API are created together.
2. Create or confirm the Amazon Location map and place index, then set `LOCATION_MAP_NAME` and `LOCATION_PLACE_INDEX`.
3. Create or confirm the Cognito user pool and app client if you want `USE_COGNITO=true`, then set `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` and `COGNITO_CLIENT_SECRET` if required.
4. Provide `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in the deployment environment.
5. If you deploy outside Serverless, ensure the Lambda execution role can read/write the DynamoDB tables and publish to SNS, and can use S3 presigned uploads.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with Nodemon |
| `npm start` | Production start |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## License

ISC
