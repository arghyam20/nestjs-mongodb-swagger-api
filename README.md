# NestJS MongoDB Swagger API Boilerplate

A progressive Node.js backend boilerplate built with [NestJS](https://nestjs.com/), designed for scalability, performance, and rapid development. This starter kit comes pre-configured with MongoDB, JWT Authentication, Swagger for API documentation, and a plethora of ready-to-use modules.

## 🚀 Features

- **Framework**: Built on top of [NestJS](https://nestjs.com/) and Express.
- **Database**: [MongoDB](https://www.mongodb.com/) integration using [Mongoose](https://mongoosejs.com/).
- **API Documentation**: Auto-generated OpenAPI (Swagger) documentation available at `/apidoc`.
- **Authentication & Authorization**:
  - JWT (JSON Web Token) based authentication.
  - Access Tokens & Refresh Tokens.
  - Role-Based Access Control (RBAC).
- **Security**:
  - [Helmet](https://helmetjs.github.io/) for setting secure HTTP headers.
  - Cross-Origin Resource Sharing (CORS) enabled.
  - Global API validation using `class-validator` and `class-transformer`.
  - Rate limiting / Throttling.
- **Email Services**: Integrated with [Nodemailer](https://nodemailer.com/) and `email-templates` for transactional emails.
- **Job Queues**: Background task processing using [Bull](https://docs.nestjs.com/techniques/queues) and Redis.
- **Document Generation**: Pre-configured tools for generating:
  - PDFs (`pdf-lib`)
  - Excel Spreadsheets (`exceljs`)
  - Word Documents (`docx`)
- **Ready-to-use Modules**:
  - `auth` - User and Admin authentication.
  - `user` & `role` - User management and permissions.
  - `admin`, `admin-reply`
  - `cms` - Content Management System APIs.
  - `category`, `contact-us`, `media`, `notification`, `setting`, and more.

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:
* **Node.js** (v20+ recommended)
* **MongoDB** (running locally or via MongoDB Atlas)
* **Redis** (required for Bull job queues)

## 🛠️ Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment file and configure your local variables.
   ```bash
   cp env.example .env
   ```
   Open the `.env` file and update the following key variables:
   - `PORT`: API Port (default: 3000)
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`: Authentication secrets and expiry times.
   - `MAIL_USERNAME`, `MAIL_PASSWORD`: SMTP credentials for email sending.

3. **Start the application:**

   ```bash
   # development
   npm run start

   # watch mode (hot-reload)
   npm run start:dev

   # production mode
   npm run build
   npm run start:prod
   ```

## 📖 API Documentation (Swagger)

Once the application is running, you can access the Swagger UI to view and interact with the API endpoints.

- **URL:** `http://localhost:<PORT>/apidoc` (e.g., [http://localhost:3000/apidoc](http://localhost:3000/apidoc))

## 📂 Project Structure

```text
src/
├── auth/           # Authentication logic (Strategies, Guards, Services)
├── common/         # Global Pipes, Filters, Interceptors, and utility functions
├── config/         # Application configurations
├── helpers/        # Helper and utility classes
├── modules/        # Feature modules (User, Admin, CMS, Media, etc.)
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

## 📜 Scripts

- `npm run build`: Compile the application to the `dist` directory.
- `npm run format`: Format source code using Prettier.
- `npm run lint`: Lint source code using ESLint.
- `npm run test`: Run unit tests using Jest.
- `npm run test:e2e`: Run End-to-End tests.
- `npm run test:cov`: Generate test coverage reports.

## 📄 License

This project is [MIT licensed](https://opensource.org/licenses/MIT).
