# Sequoia Projects Ltd - Real Estate Website

A modern, responsive real estate website built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Features

### Core Functionality
- **Modern Homepage** with hero section, featured properties, services showcase, and testimonials
- **Property Listings** with advanced filtering by status (rent/sale) and property type
- **Individual Property Pages** with image galleries, amenities, and contact forms
- **About Page** showcasing company mission, values, team members, and statistics
- **Services Page** detailing all five core services with detailed features
- **Contact Page** with comprehensive contact form and business information

### Technical Features
- ⚡ **Next.js 16** with React 19 and App Router
- 🎨 **Tailwind CSS v4** for modern, responsive styling
- ✨ **Framer Motion** for smooth animations and transitions
- 🎯 **TypeScript** for type safety
- 📱 **Fully Responsive** design for all devices
- 🖼️ **Unsplash Integration** for high-quality property images
- 🎭 **Modern UI/UX** with hover effects, animations, and smooth transitions

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
seqproject/
├── app/
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── properties/
│   │   ├── [id]/page.tsx
│   │   └── page.tsx
│   ├── services/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Navigation.tsx
│   └── Footer.tsx
├── lib/
│   └── data.ts
└── public/
```

## Customization

### Adding New Properties

Edit `lib/data.ts` and add new property objects to the `properties` array.

### Updating Team Members

Modify the `teamMembers` array in `lib/data.ts`.

### Changing Colors

The site uses emerald as the primary color. Update Tailwind classes or modify `tailwind.config.ts`.

## Technologies Used

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4, Framer Motion
- Lucide React (icons), Unsplash (images)

## Company Information

**Sequoia Projects Ltd**
- Founded: 2017
- Location: Abuja, Nigeria
- Email: info@seqprojects.com
- Phone: +234 803 456 7890

## Deploy on Vercel

The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
