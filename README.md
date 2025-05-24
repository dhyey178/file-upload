# File Upload Service

This is a NestJS backend application leveraging PostgreSQL with Prisma for database management. It's the foundational setup for a service that will eventually handle file uploads and user authentication.

## 🚀 Stacks Used

* **Runtime:** Node.js (v20)
* **Package Manager:** pnpm
* **Containerization:** Docker & Docker Compose
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Backend Framework:** NestJS
* **Password Hashing:** `bcryptjs`

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
### 4. Database Management Commands

These commands help you manage your database schema and data during development.

  * **Initialize Schema (First-time or After Reset or Schema Updates):**
    To create your database tables for the very first time / after reset, or to apply new schema changes defined in `prisma/schema.prisma` after modifying your models:
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
\q  -- Type this to exit psql

## 🧠 Design Choices

  * **Database:** PostgreSQL was chosen for its robustness, reliability, and widespread adoption in enterprise environments.
  * **ORM:** Prisma provides a modern, type-safe, and intuitive way to interact with the database, simplifying data access and schema migrations.
  * **Containerization:** Docker and Docker Compose enable consistent development environments, simplify dependency management (Node.js, PostgreSQL), and streamline deployment.
  * **Password Hashing:** bcryptjs is used for secure password hashing, providing protection against brute-force attacks and rainbow table attacks.
  * **Environment Variables:** Adhering to the 12-factor app principles, environment variables are used for configuration, separating sensitive data from source code.
  * **Modular Architecture (NestJS):** NestJS promotes a highly modular and scalable application structure, making it easy to organize features.

## ⚠️ Known Limitations or Assumptions
  * **Development Setup:** The current docker-compose.yml and db:reset script are optimized for a local development environment. Production deployments would require more robust configurations (e.g., dedicated database hosts, proper volume backups, container orchestration).
