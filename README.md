# LiteFi Landing Page

A modern, responsive landing page for LiteFi - a financial service platform offering auto loans, high-yield investments, and other financial solutions.

![LiteFi Banner](public/logo.ico)

## Project Overview

LiteFi is a financial service platform focused on providing users with a fast track to financial freedom. This landing page showcases LiteFi's primary offerings:

- **Auto Loans**: Get instant loans using your car as collateral while still being able to drive it
- **Investment Plans**: Earn up to 30% returns on flexible and goal-based investment options
- **Additional Loan Solutions**: Personal loans, business loans, and proof of funds services

The landing page is built with Next.js, React, TypeScript, and Tailwind CSS, ensuring a modern, responsive, and visually appealing user experience.

## Features & Sections

The landing page includes the following key sections:

1. **Hero Section**: Introducing LiteFi as the fast track to financial freedom
2. **Auto Loans Section**: Details about using cars as collateral for instant cash
3. **Features Section**: Highlighting the benefits of LiteFi's auto loans (fast approval, flexible repayment, etc.)
4. **Investment Section**: Information about investment plans with up to 30% returns
5. **Why Invest Section**: Reasons to choose LiteFi for investments
6. **Calculator Section**: Interactive tool to calculate potential investment returns
7. **More Solutions Section**: Overview of additional services (personal loans, business loans, proof of funds)
8. **Financial Partner Section**: Why choose LiteFi as your financial partner
9. **Footer**: Contact information, newsletter signup, and links to other pages

## Technologies Used

- **Frontend Framework**: Next.js 15.2.4
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Radix UI components
  - Shadcn UI
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animations
- **Charts**: Recharts
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/LiteFiLimited/LiteFi-Landing-Page.git
cd LiteFi-Landing-Page
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

### Development

Run the development server with Turbopack:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

Build the application for production:

```bash
npm run build
# or
pnpm build
```

Start the production server:

```bash
npm run start
# or
pnpm start
```

## Project Structure

```
LiteFi-Landing-Page/
├── app/                    # Next.js app directory
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── assets/                 # Static assets
│   ├── images/             # Image files
│   └── svgs/               # SVG files
├── components/             # React components
│   ├── ui/                 # UI components (buttons, inputs, etc.)
│   ├── HeroSection.tsx     # Hero section component
│   ├── AutoLoansSection.tsx # Auto loans section component
│   └── ...                 # Other section components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and libraries
├── public/                 # Public static files
├── styles/                 # Additional styles
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Contribution Guidelines

We welcome contributions to improve the LiteFi Landing Page. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure the code lints properly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write descriptive commit messages
- Update documentation as needed
- Add comments for complex logic

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For inquiries about LiteFi services:
- Email: loan@litefi.ng
- Phone: +234 810 837 6447
- Address: 9A, Hospital Road, Gbagada, Lagos

---
