<div align="center">

  <h1>🏛️ Abasan Alkabera Municipality Platform</h1>
  
  <p>
    <strong>A Next-Generation Digital Portal for Citizen Services</strong>
  </p>

  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://www.prisma.io">
      <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    </a>
    <a href="https://neon.tech">
      <img src="https://img.shields.io/badge/Neon-Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon" />
    </a>
    <a href="https://convex.dev">
      <img src="https://img.shields.io/badge/Convex-Realtime-EC1E25?style=for-the-badge&logo=convex&logoColor=white" alt="Convex" />
    </a>
  </p>

  <h3>
    <a href="#-features">Features</a> •
    <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-modules">Modules</a>
  </h3>

</div>

<br />

## 🌟 About The Project

**Abasan Alkabera Platform** is a comprehensive digital transformation solution designed to modernize municipal services. It bridges the gap between citizens, employees, and administration through a seamless, real-time interface.

Built with performance and scalability in mind, it leverages the latest web technologies to ensure a fast, secure, and accessible experience for everyone.

---

## ⚡️ Tech Stack

We use the best tools in the industry to build a robust platform:

-   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
-   **Database**: [Neon](https://neon.tech/) (Serverless Postgres), [Prisma ORM](https://www.prisma.io/)
-   **Real-time**: [Convex](https://www.convex.dev/) (Chat & Live Updates)
-   **Auth**: [Better Auth](https://www.better-auth.com/)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)

---

## 🚀 Features

### 🏢 For Citizens
-   **Digital Requests**: Submit building permits, complaints, and service requests online.
-   **Real-time Tracking**: Watch your request status update live.
-   **Direct Chat**: Communicate directly with municipal departments.
-   **Emergency Alerts**: Receive critical updates via the live banner system.

### 💼 For Employees
-   **Dashboard**: A powerful admin panel to manage requests and tasks.
-   **Workflow Automation**: Streamlined approval processes.
-   **Role-Based Access**: Secure access control (Engineers, Accountants, Admins).

---

## 🛠 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v20+)
-   npm or pnpm

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/your-org/abasan-municipality.git
    cd abasan-municipality
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env` file and add your credentials:
    ```env
    DATABASE_URL="postgresql://..."
    DIRECT_URL="postgresql://..."
    NEXT_PUBLIC_CONVEX_URL="https://..."
    BETTER_AUTH_SECRET="..."
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Start Convex (for real-time features)**
    ```bash
    npx convex dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Modules

| Module | Description | Status |
| :--- | :--- | :--- |
| **Auth** | Secure login/register with extensive role management | ✅ Ready |
| **Requests** | Building permits, renovations, and more | ✅ Ready |
| **Complaints** | Geo-tagged complaint submission system | ✅ Ready |
| **News** | CMS for municipal news and updates | ✅ Ready |
| **Chat** | Live support widget powered by Convex | ✅ Ready |
| **Admin** | Comprehensive dashboard for staff | ✅ Ready |

<br />

<div align="center">
  <p>Built with ❤️ for <strong>Abasan Alkabera Municipality</strong></p>
</div>
