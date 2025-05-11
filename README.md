# NexCRM - Next-Generation Customer Relationship Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Optional: Add a license badge if you choose one -->
<!-- Optional: Add other badges like build status, stars, forks if you set them up -->

**NexCRM is a modern, intuitive Customer Relationship Management application designed to help businesses manage customer interactions, track sales, and streamline operations.**

<!-- Optional: Add a GIF or a prominent screenshot of the dashboard here -->
<!-- ![NexCRM Dashboard Demo](link_to_your_demo_gif_or_screenshot.png) -->

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Cloning the Repository](#cloning-the-repository)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

## Overview

NexCRM provides a user-friendly interface to manage vital customer data, track orders, oversee marketing campaigns (via data export), and gain insights through a comprehensive dashboard. It's built with a modern tech stack focusing on performance, scalability, and developer experience. With role-based access control, NexCRM ensures that sensitive data operations are restricted to authorized personnel.

## Key Features

*   **Interactive Dashboard**: Get a quick overview of key metrics like total customers, orders, revenue, and customer visits. Visualize monthly revenue trends.
*   **Customer Management**:
    *   View a list of all customers with detailed information.
    *   Search and filter customers.
    *   Import customer data from JSON files (Admin only).
    *   Export customer data to CSV files (Admin only).
*   **Order Management**:
    *   Track and manage customer orders.
    *   Search and filter orders.
    *   Import order data from JSON files.
    *   Export order data to CSV files.
*   **Campaign Data Export**:
    *   Export campaign performance data to CSV for analysis.
*   **Settings & Configuration**:
    *   Manage user profile settings.
    *   Configure notification preferences (UI implemented, backend integration pending).
    *   Centralized data management for import/export operations.
*   **Role-Based Access Control (RBAC)**:
    *   Admin role with exclusive rights to import/export sensitive customer data.
    *   User roles with standard access.
*   **Secure Authentication**:
    *   Google OAuth for easy and secure login.
*   **Responsive Design**:
    *   Accessible on various devices thanks to Tailwind CSS and shadcn/ui.

## Tech Stack

### Frontend

*   **Framework/Library**: [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/) for fast bundling)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Routing**: [React Router DOM](https://reactrouter.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **State Management**: React Context API (e.g., `useAuth`)
*   **API Client**: Browser `fetch` API (or Axios, if used)

### Backend (Assumed based on API interactions)

*   **Framework**: Likely [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
*   **Language**: TypeScript or JavaScript
*   **Database**: Likely a NoSQL database like [MongoDB](https://www.mongodb.com/) (inferred from `_id` structure and common MERN stack patterns)
*   **Authentication**: Passport.js (or similar) with Google OAuth strategy, custom session/token management.
*   **API**: RESTful API endpoints (e.g., `/api/data/customers`, `/api/data/orders`, `/api/auth/me`)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18.x or v20.x)
*   [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/)
*   Git
*   Access to a MongoDB instance (if that's your chosen DB)
*   Google OAuth credentials for authentication setup on the backend.

### Cloning the Repository

```
git clone https://github.com/AdityaGupta0001/NexCRM.git
cd NexCRM
```


### Frontend Setup

The current repository seems to contain the frontend code.

1.  **Install Dependencies:**
    Navigate to the frontend project directory (if it's nested, otherwise root is fine) and run:
    ```
    npm install
    # or
    # pnpm install
    # or
    # yarn install
    ```

2.  **Configure Environment Variables (Frontend):**
    Create a `.env` file in the root of your frontend project (or where Vite expects it, usually root).
    Add any frontend-specific environment variables, for example:
    ```
    VITE_API_BASE_URL=http://localhost:3000/api
    # Add other frontend env variables if any (e.g., Google Client ID for frontend part of OAuth if needed)
    ```

### Backend Setup

*(These are general instructions. You'll need to adapt them to your actual backend setup if it's in a separate repository or a sub-directory not yet present.)*

1.  **Clone Backend Repository (if separate):**
    If your backend is in a different repository, clone it.
    ```
    # git clone <your_backend_repo_url>
    # cd <your_backend_project_name>
    ```

2.  **Install Backend Dependencies:**
    ```
    npm install
    # or
    # pnpm install
    # or
    # yarn install
    ```

3.  **Configure Backend Environment Variables:**
    Create a `.env` file in the root of your backend project. This is crucial for database connections, authentication secrets, etc.
    Example `.env` for the backend:
    ```
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback # Or your frontend URL for redirect
    SESSION_SECRET=a_very_strong_secret_key_for_sessions
    CLIENT_ORIGIN=http://localhost:5173 # Your frontend URL (Vite default)
    # Add any other backend-specific variables
    ```

4.  **Database Setup:**
    *   Ensure your MongoDB instance is running and accessible.
    *   If you have database schema migrations or seed scripts, run them.

### Running the Application

1.  **Start the Backend Server:**
    Navigate to your backend project directory and run:
    ```
    npm run dev
    # or your specific start script (e.g., npm start)
    ```
    The backend should typically be running on `http://localhost:3000`.

2.  **Start the Frontend Development Server:**
    Navigate to your frontend project directory (NexCRM root in this case) and run:
    ```
    npm run dev
    ```
    The frontend development server will usually start on `http://localhost:8080`.

Open your browser and go to `http://localhost:8080` to see the application.

## Usage

*   **Login**: Access the application and log in using your Google account.
*   **Dashboard**: View aggregated statistics and charts.
*   **Customers/Orders**: Navigate to the respective sections to view, search, import, or export data.
*   **Settings**: Configure your profile and manage data import/export for various modules. Admin users have special privileges for customer data.

## Data Management

NexCRM supports:
*   **Import**: Upload customer and order data from JSON files.
*   **Export**: Download customer, order, and campaign data as CSV files for offline analysis or use in other tools.

## Contributing

Contributions are welcome! If you'd like to contribute to NexCRM, please follow these steps:

1.  **Fork the repository** on GitHub.
2.  **Clone your forked repository** to your local machine.
3.  **Create a new branch** for your feature or bug fix:
    ```
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/your-bug-fix-name
    ```
4.  **Make your changes** and commit them with clear, descriptive messages.
5.  **Push your changes** to your forked repository:
    ```
    git push origin feature/your-feature-name
    ```
6.  **Open a Pull Request (PR)** from your forked repository to the `main` branch of `AdityaGupta0001/NexCRM`.
7.  Provide a detailed description of your changes in the PR.

Please ensure your code adheres to the existing coding style and includes tests if applicable.

## Future Enhancements

*(You can list planned features or areas for improvement here. Examples:)*
*   Full Campaign Management module (creation, scheduling, tracking).
*   Advanced reporting and analytics.
*   Integration with third-party services (e.g., email marketing platforms).
*   Mobile application.
*   Enhanced customization options.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.
*(Consider adding an MIT License file to your repository if you haven't already.)*

## Acknowledgements

*   [shadcn/ui](https://ui.shadcn.com/) for the fantastic UI components.
*   [Lucide Icons](https://lucide.dev/) for the clean and beautiful icons.
*   [Recharts](https://recharts.org/) for making charting easy.
*   The creators of React, Vite, TypeScript, and Tailwind CSS.

## Contact

Aditya Gupta - [Your GitHub Profile](https://github.com/AdityaGupta0001)