# Creova

A modern AI-powered website builder and launch platform that turns ideas into polished, responsive websites in minutes. Built with a TypeScript backend, React + Vite frontend, and a full SaaS workflow for generating, managing, previewing, and publishing projects.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe" alt="Stripe" />
</p>

## Overview

Creova is designed for creators, founders, and teams who want to go from idea to production-ready website quickly. Users can describe a brand or product, generate a full site using AI, refine it in a visual builder, and deploy it to GitHub or Vercel with minimal friction.

This project combines:

- AI-assisted website generation
- Authentication and user accounts
- Project dashboard and builder flow
- Preview and publishing workflows
- Community project showcase
- Subscription and billing integration

## Features

### AI Website Generation
- Generate responsive landing pages and multi-page sites from a short description
- Build websites tailored to business type, brand voice, and product positioning
- Use AI-powered content and layout scaffolding to speed up production

### Project Dashboard
- Manage user projects from a centralized dashboard
- Open and edit saved designs
- Preview generated sites before publishing

### Deployment and Publishing
- Export or publish generated projects to GitHub
- Deploy to Vercel with environment-aware build flows
- Maintain project metadata, preview URLs, and deployment status

### Authentication and User Management
- Register, login, forgot-password, and email verification flows
- JWT-based authenticated sessions
- Secure protected routes for builder and settings pages

### Community Platform
- Showcase published projects to the wider community
- Like and explore other user submissions
- Encourage discovery and inspiration across generated sites

### Payments and SaaS Billing
- Pricing page and plan structure
- Stripe checkout integration for subscriptions and monetization

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- React Hot Toast

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Stripe
- Brevo for email communication

## Getting Started

### Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- MongoDB instance or MongoDB Atlas connection string
- Stripe account and secret key
- Vercel token for deployments
- Brevo API key for email workflows

### 1) Clone the Repository

```bash
git clone https://github.com/Musaazmat/Creavo.git
# cd AI
```

### 2) Install Backend Dependencies

```bash
cd backend
npm install
```

### 3) Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4) Configure Environment Variables

Create a `.env` file in the `backend/` directory and add the following keys:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=Creova
STRIPE_SECRET_KEY=your_stripe_secret_key
VERCEL_TOKEN=your_vercel_token
```

> You may also need to configure any additional API keys used by AI generation and deployment features depending on your environment.

### 5) Run the Backend

```bash
cd backend
npm start
```

The backend runs at:

- http://localhost:4000

### 6) Run the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs at:

- http://localhost:5173

## Why This Project Stands Out

Creova is more than a simple site generator. It combines design, product management, deployment, onboarding, and monetization into one cohesive SaaS experience. The platform is built to feel like a real modern startup product instead of a basic demo.

## License

This project is currently unlicensed. If you plan to distribute or commercialize it, add an appropriate license such as MIT or Apache 2.0.

## Contributing

Contributions are welcome. If you want to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear summary

## Future Enhancements

- Advanced AI prompt refinement and design presets
- More editing controls inside the builder
- Template marketplace
- Better analytics and deployment logs
- Team collaboration and multi-user workspaces