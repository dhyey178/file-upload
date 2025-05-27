# Secure File Upload & Metadata Processing Microservice

## 🗂️ Overview

This project implements a Nest.js backend microservice designed to handle authenticated file uploads, store associated metadata in a PostgreSQL database using Prisma, and process those files asynchronously via a background job queue. This solution addresses core backend engineering challenges such as security (JWT authentication, access control), asynchronous operations, and structured API design.

The primary objective is to build a secure file upload service that:
* Authenticates users and issues JWT tokens.
* Allows authenticated users to upload files with optional metadata.
* Saves file data to local storage and metadata to a database.
* Enqueues files for background processing, tracking their status.
* Provides an API to retrieve file information, including processing status and extracted data, ensuring user-specific access.

## ✨ Features Implemented

Based on the project requirements:

### 🚀 Functional Features
* **Authentication (JWT):**
    * User registration (`POST /auth/register`). (Not mentioned in requirments but added for ease of creating user & testing)
    * User login (`POST /auth/login`) issuing a JWT token.
    * JWT token required for all API requests except login and health check.
* **File Upload API (`POST /files/upload`):**
    * Accepts a file (any type) and optional metadata (title, description).
    * Saves files to a local `./uploads` directory.
    * Stores file metadata and storage path in the PostgreSQL database.
    * Adds a job to a background queue (BullMQ) for processing.
    * Returns file ID and initial status (`uploaded`).
* **File Processing (Async Job):**
    * Utilizes **BullMQ** with **Redis** for robust background job queueing.
    * Simulates file processing (e.g., checksum calculation or simple `setTimeout`).
    * Updates the file status in the database (`processing` → `processed` or `failed`).
    * Saves any "extracted data" (e.g., file hash) back to the database.
* **File Status API (`GET /files/:id`):**
    * Requires authentication (JWT).
    * Returns complete file metadata, current status, and extracted data (if available).
    * Strictly enforces that only the user who uploaded a file can retrieve its information.
* **File Listing API (`GET /files?page=1&limit=10`):**
    * Requires authentication (JWT).
    * Returns a paginated list of files uploaded by the authenticated user.

### 🔒 Security Features
* JWT token validation on all protected routes.
* User-based access control: Users can only view their own files.
* Password hashing using `bcryptjs`.
* Environment variables for sensitive configurations (JWT secret, DB credentials, etc.).
* Basic upload size limit of 10MB enforced by `multer`.
* Basic Rate Limiting of 5 requests per user per minute enforced by Throttler. 

### ➕ Optional Enhancements (Implemented)
* **Pagination:** `GET /files?page=1&limit=10`
* **Dockerfile + docker-compose setup:** For Node.js, PostgreSQL, and Redis.
* **Swagger/OpenAPI documentation:** Accessible via `/api` endpoint.
* **Postman collection/cURL scripts:** Available in /postman folder in the repo. Please set up your Postman environment to have base_url (initial value as http://localhost:3000 or your equivalent server address ) & jwt_token (initial value as empty string, will be filled automatically when login endpoint is called)

## ⚙️ Stacks Used

* **Runtime:** Node.js (v20)
* **Package Manager:** pnpm
* **Backend Framework:** [NestJS](https://nestjs.com/)
* **Containerization:** [Docker & Docker Compose](https://www.docker.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Authentication:** JWT (using `@nestjs/jwt` and `@nestjs/passport`)
* **Password Hashing:** `bcryptjs`
* **Background Jobs:** [BullMQ](https://docs.bullmq.io/) (with [Redis](https://redis.io/) backend)
* **File Handling:** `multer`
* **Validation:** `class-validator`
* **API Documentation:** `@nestjs/swagger`


## ⚙️ How to Run Locally

Follow these steps to get the application up and running on your local machine using Docker Compose.

### 1. Prerequisites

Ensure you have the following installed:

* [**Docker Desktop**](https://www.docker.com/products/docker-desktop) (includes Docker Engine and Docker Compose)
* [**pnpm**](https://pnpm.io/installation) (for local development commands, though Docker handles dependencies within containers)

### 2. Environment Setup

This project uses environment variables for sensitive configurations.

  * **Create `.env` file:**
    Copy the provided `.env.example` file to `.env` in the root directory of the project:
    ```bash
    cp .env.example .env
    ```

### 3. Build and Start Services

Navigate to the project root directory in your terminal and run:

```bash
docker compose up --build -d
```

This command will:
* Build the Docker images for the NestJS application, PostgreSQL, and Redis.
* Start all services in detached mode (-d).
* The application will be accessible at http://localhost:3000.
* Swagger API documentation will be available at http://localhost:3000/api.

### 4. Database Management Commands

These commands help you manage your database schema and data during development. Ensure your Docker Compose services are running before executing these.


  * **Initialize Schema (Schema Updates):**
    To create your database tables to apply new schema changes defined in `prisma/schema.prisma` after modifying your models:

    ```bash
    docker compose run --rm app pnpm prisma migrate dev --name <migration_name>
    ```
    *Replace `<migration_name>` with a descriptive name (e.g., `init`, `add_products_table`). This command creates and applies a new migration file.*

  * **Reset Database (Full Wipe & Rebuild):**
    To completely wipe all data and tables.
    ```bash
    docker compose run --rm app pnpm run db:reset
    ```

  * **Seed Database (Populate Initial Data):**
    To populate your database with initial data (e.g., an admin user). This command should be run *after* your database schema has been initialized.
    ```bash
    docker compose run --rm app pnpm run db:seed
    ```
### 5. Verify Database State

You can connect directly to the PostgreSQL container to inspect the database:

```bash
docker compose exec db psql -U postgres -d file_upload
```
Once at the file_upload=# prompt, you can run SQL queries, for example:
```bash
SELECT * FROM "User";
```

Type `\q` to exit psql.

## 🚀 API Endpoints


## 🧠 Design Choices
  * **Backend Framework (NestJS):** Chosen for its robust, modular, and scalable architecture. It provides a strong foundation for building enterprise-grade applications with features like dependency injection, modules, decorators, and an opinionated structure that enforces best practices.

  * **Database (PostgreSQL):** Selected for its reliability, data integrity, advanced features, and widespread adoption in production environments, making it a solid choice for a backend microservice.

  * **ORM (Prisma):** Offers a modern, type-safe, and intuitive way to interact with the database. It simplifies schema migrations, provides a powerful query builder, and integrates seamlessly with TypeScript, enhancing developer productivity and reducing common database-related errors.

  * **Containerization (Docker & Docker Compose):** Ensures consistent development environments across different machines, simplifies dependency management (Node.js runtime, PostgreSQL database, Redis), and streamlines the setup and deployment process.

  * **Authentication (JWT):** JSON Web Tokens provide a stateless, secure, and widely adopted method for user authentication. The implementation uses `Passport.js` strategies for local (email/password) and JWT authentication, ensuring secure access control.

  * **Password Hashing (`bcryptjs`):** Essential for securely storing user passwords. bcryptjs is a strong, industry-standard hashing algorithm that protects against brute-force and rainbow table attacks.

  * **Environment Variables:** Adhering to the 12-factor app principles, all sensitive configurations (database URL, JWT secret, Redis credentials) are managed via environment variables, separating them from the codebase for enhanced security and flexibility.

  * **Background Jobs (BullMQ with Redis):** Crucial for asynchronous file processing. BullMQ provides a robust, Redis-backed job queue, preventing long-running tasks from blocking the main API thread, improving API responsiveness and overall system reliability.

  * **API Design:** Follows RESTful principles with clean, intuitive endpoints and standard HTTP methods. Uses DTOs (`Data Transfer Objects`) for clear data contracts between the client and server.

  * **Error Handling:** Implements global validation pipes (`class-validator`, `class-transformer`) and custom exceptions (e.g., `NotFoundException`) for consistent and informative error responses.


## ⚠️ Known Limitations or Assumptions

This project, while demonstrating core functionalities and best practices, has certain limitations or makes specific assumptions due to its nature as a time-boxed technical assessment:


  * **Production Readiness:** 
    * **Scalability:** The current `docker-compose.yml` is optimized for local development. A production setup would require a dedicated, scalable database (e.g., AWS RDS), a robust Redis cluster, and container orchestration (e.g., Kubernetes) for the Node.js service.

    * **File Storage:** Files are stored locally within the Docker container's filesystem. In a production environment, this should be replaced with a cloud storage solution like AWS S3, Google Cloud Storage, or Azure Blob Storage, along with proper volume mounts/backups.

    * **Logging & Monitoring:** Basic logging is provided by NestJS/console. A production system would integrate with a centralized logging solution (e.g., ELK stack, Datadog) and monitoring tools.

    * **Error Handling (File Processing):** The current failed status is simple. A more robust system would include detailed error messages, retry mechanisms (e.g., exponential backoff for transient errors), and alerts.

    * **Security (Beyond JWT):** While JWT and basic access control are implemented, a full production system would include stricter input validation, more comprehensive rate limiting, CORS configuration, CSRF protection, and potentially WAF integration.

  * **File Processing Simulation:** The background job simulates file processing (e.g., file hash). In a real-world scenario, this would involve actual data extraction, virus scanning, content analysis, or other complex operations. The "extracted data" is currently a simple hash.

  * **User Management:** Basic user registration and login are provided. Features like password reset, email verification, user roles, or user deletion are not implemented.

  * **Test Coverage:** This project focuses on demonstrating functional requirements and best practices in code structure. Comprehensive unit, integration, and end-to-end tests would be essential for a production application.
