export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  status: 'rent' | 'sale';
  type: string;
  area?: number;
  guests?: number;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  garages?: number;
  units?: number;
  description: string;
  amenities: string[];
  images?: string[];
  primary_image?: string;
  categorizedImages?: {
    category: string;
    images: string[];
  }[];
  featured: boolean;
  entity?: string; // The entity/owner managing this property
  agent: {
    name: string;
    phone: string;
    mobile: string;
    email: string;
    skype?: string;
  };
}

export interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
}

export interface Service {
  title: string;
  description: string;
  icon: string;
  features: string[];
}

/**
 * PROPERTY MANAGEMENT SYSTEM
 *
 * This array contains all properties managed by different entities.
 *
 * TO ADD A NEW PROPERTY:
 * 1. Add your property images to: public/properties/[your-property-folder-name]/
 * 2. Copy the property template below and fill in the details
 * 3. Set the 'entity' field to identify the property owner/manager
 * 4. Use relative paths for images: '/properties/[folder-name]/[image-name].jpg'
 *
 * CURRENT ENTITIES:
 * - Sequoia Projects (Main company properties)
 * - Arusha Property Management
 * - Jacobs Bay Real Estate
 *
 * You can add new entities by simply creating a new property with a new entity name.
 */

export const properties: Property[] = [
  // {
  //   id: 'nomads-nest',
  //   title: 'Nomads Nest - Luxury Villa',
  //   location: '3, Nasiru Dantata Road, Dantata Estate, Kubwa',
  //   price: 150000,
  //   currency: '₦',
  //   status: 'rent',
  //   type: 'Villa',
  //   area: 1400,
  //   bedrooms: 4,
  //   bathrooms: 4,
  //   livingRooms: 3,
  //   units: 2,
  //   description: 'Escape to a serene villa in Abuja\'s heart, just 10 mins from the CBD. Luxurious 4-bed retreat with 3 living rooms, a private pool, and 24/7 electricity. Ideal for 8 guests, it offers a perfect blend of tranquility and convenience, surrounded by greenery. Direct route to the airport, groceries, and eateries within a 2-min walk. Your Abuja oasis awaits!',
  //   amenities: ['Mini Gym', 'Swimming Pool', 'Parking', 'Kitchen', 'Wifi', 'Dedicated Workspace', 'Free Parking', '24/7 Electricity'],
  //   images: [
  //     'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  //     'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
  //     'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  //   ],
  //   featured: true,
  //   entity: 'Sequoia Projects',
  //   agent: {
  //     name: 'Anabella Geller',
  //     phone: '(222) 456-8932',
  //     mobile: '777 287 378 737',
  //     email: 'info@seqprojects.com',
  //     skype: 'Annabela.ge'
  //   }
  // },
  // {
  //   id: 'ali-baba-crescent',
  //   title: 'Luxury 1-Bedroom Apartments',
  //   location: 'Ali Baba Crescent, Jabi, Abuja',
  //   price: 80000,
  //   currency: '₦',
  //   status: 'rent',
  //   type: 'Apartment',
  //   area: 1600,
  //   bedrooms: 1,
  //   bathrooms: 1,
  //   livingRooms: 1,
  //   units: 4,
  //   description: 'Four units of luxurious 1-bedroom apartments. Contemporary urban sanctuary or a sophisticated living space — designed for relaxation, entertainment, and privacy. The en-suite bedroom offers privacy and comfort. Living room designed for gatherings or solitude. Amenities include a garden area, designated parking spaces, and secure access.',
  //   amenities: ['Swimming Pool', 'Gym', 'Fun Area', 'BBQ Space', 'Parking', 'Garden', 'Security'],
  //   images: [
  //     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  //     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  //     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  //   ],
  //   featured: true,
  //   entity: 'Sequoia Projects',
  //   agent: {
  //     name: 'Tijjani Musa',
  //     phone: '(222) 456-8932',
  //     mobile: '777 287 378 737',
  //     email: 'info@seqprojects.com',
  //   }
  // },
  {
    id: 'arusha-crescent',
    title: 'Executive 2-Bedroom Apartment',
    location: '7 Arusha Crescent, Wuse Zone 1, Abuja',
    price: 120000,
    currency: '₦',
    status: 'rent',
    type: 'Apartment',
    guests: 2,
    bedrooms: 2,
    bathrooms: 4,
    livingRooms: 1,
    garages: 1,
    description: 'Executive 2-bedroom apartment in the prestigious Wuse Zone 1. Modern design with spacious living areas, premium finishes, and state-of-the-art amenities. Perfect for professionals and families seeking luxury and convenience in the heart of Abuja.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Water Supply', 'Serviced', 'Garage'],
    images: [
      // Property Front/Exterior
      '/properties/arusha/arusha-crescent-wuse-zone1-property-front/PHOTO-2025-12-21-20-26-34.jpg',
      '/properties/arusha/arusha-crescent-wuse-zone1-property-front/PHOTO-2025-12-21-20-26-30.jpg',
      '/properties/arusha/arusha-crescent-wuse-zone1-property-front/PHOTO-2025-12-21-20-26-33.jpg',
      // General Property Pictures
      '/properties/arusha/arusha-pictures/PHOTO-2025-08-19-15-49-21_1.jpg',
      '/properties/arusha/arusha-pictures/PHOTO-2025-08-19-15-49-21_2.jpg',
      '/properties/arusha/arusha-pictures/PHOTO-2025-08-19-15-49-21_3.jpg',
      '/properties/arusha/arusha-pictures/PHOTO-2025-08-19-15-49-21_4.jpg',
      // Room Pictures
      '/properties/arusha/arusha-room-pictures/PHOTO-2025-08-19-15-24-52_10.jpg',
      '/properties/arusha/arusha-room-pictures/PHOTO-2025-08-19-15-24-52_11.jpg',
      '/properties/arusha/arusha-room-pictures/PHOTO-2025-08-19-15-24-52_12.jpg',
      '/properties/arusha/arusha-room-pictures/PHOTO-2025-08-19-15-24-52_15.jpg',
      '/properties/arusha/arusha-room-pictures/PHOTO-2025-08-19-15-24-52_18.jpg',
    ],
    featured: true,
    entity: 'Arusha Property Management',
    agent: {
      name: 'Tijjani Musa',
      phone: '(222) 456-8932',
      mobile: '777 287 378 737',
      email: 'info@seqprojects.com',
    }
  },
  {
    id: 'arusha-101-spl-wuse',
    title: 'Arusha 101 by SPL - Premium Apartment',
    location: 'Arusha 101 by SPL, Wuse Zone 1, Abuja',
    price: 75000,
    currency: '₦',
    status: 'rent',
    type: 'Apartment',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    garages: 1,
    description: 'Experience ultimate comfort in the heart of Abuja—just 4 mins from the US Embassy. Nestled in a quiet, secure residential area, yet within walking distance to groceries and eateries. Safe, serene, and perfect even for evening strolls.',
    amenities: ['Fully Equipped Kitchen', 'WiFi', '24/7 Electricity', 'Water Supply', 'Security', 'Parking', 'Air Conditioning', 'Cable TV', 'Serviced'],
    images: [
      '/properties/arusha-101-by-spl -wuse-zone-1/living-room/living-room-view-one.jpg',
      '/properties/arusha-101-by-spl -wuse-zone-1/full-kitchen/full-kitchen.jpg',
      '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-one.jpg',
      '/properties/arusha-101-by-spl -wuse-zone-1/full-bathroom/bathroom-view-one.jpg',
    ],
    categorizedImages: [
      {
        category: 'Living Room',
        images: [
          '/properties/arusha-101-by-spl -wuse-zone-1/living-room/living-room-view-one.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/living-room/living-room-view-two.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/living-room/living-room-view-three.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/living-room/living-room-view-four.jpg',
        ]
      },
      {
        category: 'Kitchen',
        images: [
          '/properties/arusha-101-by-spl -wuse-zone-1/full-kitchen/full-kitchen.jpg',
        ]
      },
      {
        category: 'Bedroom',
        images: [
          '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-one.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-two.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-three.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-four.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-five.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/bedroom/bedroom-view-six.jpg',
        ]
      },
      {
        category: 'Bathroom',
        images: [
          '/properties/arusha-101-by-spl -wuse-zone-1/full-bathroom/bathroom-view-one.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/full-bathroom/bathroom-view-two.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/full-bathroom/bathroom-view-three.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/full-bathroom/bathroom-view-four.jpg',
        ]
      },
      {
        category: 'Additional Views',
        images: [
          '/properties/arusha-101-by-spl -wuse-zone-1/additional-photo/additional-view-one.jpg',
          '/properties/arusha-101-by-spl -wuse-zone-1/additional-photo/additional-view-two.jpg',
        ]
      }
    ],
    featured: true,
    entity: 'Arusha Property Management',
    agent: {
      name: 'Tijjani Musa',
      phone: '(222) 456-8932',
      mobile: '777 287 378 737',
      email: 'info@seqprojects.com',
    }
  },
  {
    id: 'arusha-102-spl-wuse',
    title: 'Arusha 102 by SPL - Cozy Apartment',
    location: 'Arusha 102 by SPL, Wuse Zone 1, Abuja',
    price: 75000,
    currency: '₦',
    status: 'rent',
    type: 'Apartment',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    garages: 1,
    description: 'Experience ultimate comfort in the heart of Abuja. This stylish, centrally-located retreat offers easy access to top restaurants and stores, yet sits within a quiet, secure residential neighborhood—perfect for both relaxation and convenience.',
    amenities: ['Fully Equipped Kitchen', 'WiFi', '24/7 Electricity', 'Water Supply', 'Security', 'Parking', 'Air Conditioning', 'Cable TV', 'Serviced'],
    images: [
      '/properties/arusha-102/living-room/living-room-one.jpg',
      '/properties/arusha-102/full-kitchen/full-kitchen-one.jpg',
      '/properties/arusha-102/bedroom/bedroom-one.jpg',
      '/properties/arusha-102/full-bathroom/full-bathroom-one.jpg',
    ],
    categorizedImages: [
      {
        category: 'Living Room',
        images: [
          '/properties/arusha-102/living-room/living-room-one.jpg',
        ]
      },
      {
        category: 'Kitchen',
        images: [
          '/properties/arusha-102/full-kitchen/full-kitchen-one.jpg',
          '/properties/arusha-102/full-kitchen/full-kitchen-two.jpg',
          '/properties/arusha-102/full-kitchen/full-kitchen-three.jpg',
        ]
      },
      {
        category: 'Bedroom',
        images: [
          '/properties/arusha-102/bedroom/bedroom-one.jpg',
          '/properties/arusha-102/bedroom/bedroom-two.jpeg',
          '/properties/arusha-102/bedroom/bedroom-three.jpeg',
        ]
      },
      {
        category: 'Bathroom',
        images: [
          '/properties/arusha-102/full-bathroom/full-bathroom-one.jpg',
          '/properties/arusha-102/full-bathroom/full-bathroom-two.jpg',
        ]
      },
      {
        category: 'Additional Views',
        images: [
          '/properties/arusha-102/additional-photo/additional-photo-view-one.jpg',
          '/properties/arusha-102/additional-photo/additional-photo-view-two.jpg',
          '/properties/arusha-102/additional-photo/additional-photo-view-three.jpg',
        ]
      }
    ],
    featured: true,
    entity: 'Arusha Property Management',
    agent: {
      name: 'Tijjani Musa',
      phone: '(222) 456-8932',
      mobile: '777 287 378 737',
      email: 'info@seqprojects.com',
    }
  },
  {
    id: 'arusha-103-spl-wuse',
    title: 'Arusha 103 by SPL - Elegant Apartment',
    location: 'Arusha 103 by SPL, Wuse Zone 1, Abuja',
    price: 75000,
    currency: '₦',
    status: 'rent',
    type: 'Apartment',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    garages: 1,
    description: 'Experience ultimate comfort in the heart of Abuja—just 4 mins from the US Embassy. Nestled in a quiet, secure residential area, yet within walking distance to groceries and eateries. Safe, serene, and perfect even for evening strolls.',
    amenities: ['Fully Equipped Kitchen', 'WiFi', '24/7 Electricity', 'Water Supply', 'Security', 'Parking', 'Air Conditioning', 'Cable TV', 'Serviced'],
    images: [
      '/properties/arusha-103/living-room/living-room-view-one.jpg',
      '/properties/arusha-103/full-kitchen/full-kitchen-view-one.jpg',
      '/properties/arusha-103/bedroom/bedroom-view-one.jpg',
      '/properties/arusha-103/full-bathroom/full-bathroom-view-one.jpg',
    ],
    categorizedImages: [
      {
        category: 'Living Room',
        images: [
          '/properties/arusha-103/living-room/living-room-view-one.jpg',
          '/properties/arusha-103/living-room/living-room-view-two.jpg',
          '/properties/arusha-103/living-room/living-room-view-three.jpg',
          '/properties/arusha-103/living-room/living-room-view-four.jpg',
        ]
      },
      {
        category: 'Kitchen',
        images: [
          '/properties/arusha-103/full-kitchen/full-kitchen-view-one.jpg',
          '/properties/arusha-103/full-kitchen/full-kitchen-view-two.jpg',
        ]
      },
      {
        category: 'Bedroom',
        images: [
          '/properties/arusha-103/bedroom/bedroom-view-one.jpg',
          '/properties/arusha-103/bedroom/bedroom-view-two.jpg',
          '/properties/arusha-103/bedroom/bedroom-view-three.jpg',
          '/properties/arusha-103/bedroom/bedroom-view-four.jpg',
        ]
      },
      {
        category: 'Bathroom',
        images: [
          '/properties/arusha-103/full-bathroom/full-bathroom-view-one.jpg',
          '/properties/arusha-103/full-bathroom/full-bathroom-view-two.jpg',
        ]
      },
      {
        category: 'Additional Views',
        images: [
          '/properties/arusha-103/additional-photo/additional-photo-view.jpg',
        ]
      }
    ],
    featured: true,
    entity: 'Arusha Property Management',
    agent: {
      name: 'Tijjani Musa',
      phone: '(222) 456-8932',
      mobile: '777 287 378 737',
      email: 'info@seqprojects.com',
    }
  },
  {
    id: 'arusha-104-spl-wuse',
    title: 'Arusha 104 by SPL - Modern Apartment',
    location: 'Arusha 104 by SPL, Wuse Zone 1, Abuja',
    price: 75000,
    currency: '₦',
    status: 'rent',
    type: 'Apartment',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    garages: 1,
    description: 'Experience ultimate comfort in the heart of Abuja—just 4 mins from the US Embassy. Nestled in a quiet, secure residential area, yet within walking distance to groceries and eateries. Safe, serene, and perfect even for evening strolls.',
    amenities: ['Fully Equipped Kitchen', 'WiFi', '24/7 Electricity', 'Water Supply', 'Security', 'Parking', 'Air Conditioning', 'Cable TV', 'Serviced'],
    images: [
      '/properties/arusha-104/living-room/living-room-view-one.jpg',
      '/properties/arusha-104/full-kitchen/full-kitchen-view-one.jpg',
      '/properties/arusha-104/bedroom/bedroom-view-one.jpg',
      '/properties/arusha-104/full-bathroom/full-bathroom-view-one.jpg',
    ],
    categorizedImages: [
      {
        category: 'Living Room',
        images: [
          '/properties/arusha-104/living-room/living-room-view-one.jpg',
          '/properties/arusha-104/living-room/living-room-view-two.jpg',
        ]
      },
      {
        category: 'Kitchen',
        images: [
          '/properties/arusha-104/full-kitchen/full-kitchen-view-one.jpg',
          '/properties/arusha-104/full-kitchen/full-kitchen-view-two.jpg',
        ]
      },
      {
        category: 'Bedroom',
        images: [
          '/properties/arusha-104/bedroom/bedroom-view-one.jpg',
          '/properties/arusha-104/bedroom/bedroom-view-two.jpg',
          '/properties/arusha-104/bedroom/bedroom-view-three.jpg',
        ]
      },
      {
        category: 'Bathroom',
        images: [
          '/properties/arusha-104/full-bathroom/full-bathroom-view-one.jpg',
          '/properties/arusha-104/full-bathroom/full-bathroom-view-two.jpg',
        ]
      },
      {
        category: 'Additional Views',
        images: [
          '/properties/arusha-104/additional-photo/additional-photo-view-one.jpg',
          '/properties/arusha-104/additional-photo/additional-photo-view-two.jpg',
          '/properties/arusha-104/additional-photo/additional-photo-view-three.jpg',
          '/properties/arusha-104/additional-photo/additional-photo-view-four.jpg',
        ]
      }
    ],
    featured: true,
    entity: 'Arusha Property Management',
    agent: {
      name: 'Tijjani Musa',
      phone: '(222) 456-8932',
      mobile: '777 287 378 737',
      email: 'info@seqprojects.com',
    }
  },
  // {
  //   id: 'retreat-villa',
  //   title: 'Nomads Nest Retreat',
  //   location: 'Kubwa, Abuja',
  //   price: 180000,
  //   currency: '₦',
  //   status: 'rent',
  //   type: 'Entire Home',
  //   area: 2000,
  //   bedrooms: 5,
  //   bathrooms: 5,
  //   livingRooms: 2,
  //   description: 'Entire luxury home in Nigeria perfect for retreats, family gatherings, or corporate getaways. Spacious compound with premium amenities and serene environment.',
  //   amenities: ['Pool', 'Gym', 'Garden', 'BBQ Area', 'Parking', 'Wifi', 'Kitchen', 'Security'],
  //   images: [
  //     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  //     'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80',
  //     'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
  //   ],
  //   featured: false,
  //   entity: 'Sequoia Projects',
  //   agent: {
  //     name: 'Anabella Geller',
  //     phone: '(222) 456-8932',
  //     mobile: '777 287 378 737',
  //     email: 'info@seqprojects.com',
  //   }
  // },
  {
    id: 'jacobs-bay-villa',
    title: 'Jacobs Bay Villa',
    location: 'Jacobs Bay Real Estate Development',
    price: 250000000,
    currency: '₦',
    status: 'sale',
    type: 'Development Project',
    area: 2500,
    bedrooms: 4,
    bathrooms: 5,
    livingRooms: 2,
    garages: 2,
    description: 'Premium estate development project at Jacobs Bay. Villa 2 features stunning architectural plans including penthouse, ground floor, and first floor layouts. This is a luxury villa development project offering modern design, spacious layouts, and premium finishes. Ideal investment opportunity for discerning buyers seeking exclusivity in a gated estate.',
    amenities: ['Penthouse Design', 'Modern Architecture', 'Spacious Layout', 'Premium Finishes', 'Multiple Floors', 'Garage', 'Security', 'Gated Estate', 'Investment Opportunity'],
    images: [
      '/properties/jacobs-bay-real-estate-villa-project/Villa 2 Penthouse.jpg',
      '/properties/jacobs-bay-real-estate-villa-project/Villa 2 Ground Floor Plan.jpg',
      '/properties/jacobs-bay-real-estate-villa-project/Villa 2 First Floor Plan.jpg',
    ],
    featured: true,
    entity: 'Jacobs Bay Real Estate',
    agent: {
      name: 'Aminu Ibrahim',
      phone: '(222) 456-8932',
      mobile: '777 287 378 737',
      email: 'info@seqprojects.com',
    }
  }
];

export const teamMembers: TeamMember[] = [
  {
    name: 'Aminu Ibrahim',
    role: 'Managing Director',
    phone: '+234 803 456 7890',
    email: 'info@seqprojects.com',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'
  },
  {
    name: 'Fatima Mohammed',
    role: 'Head of Property Management',
    phone: '+234 803 456 7891',
    email: 'info@seqprojects.com',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
  },
  {
    name: 'Chidi Okafor',
    role: 'Construction Manager',
    phone: '+234 803 456 7892',
    email: 'info@seqprojects.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
  }
];

export const services: Service[] = [
  {
    title: 'Real Estate',
    description: 'Comprehensive real estate services for buying, selling, and leasing residential and commercial properties.',
    icon: 'Building2',
    features: [
      'Property buying and selling',
      'Residential leasing',
      'Commercial property management',
      'Market analysis and valuation',
      'Legal documentation support'
    ]
  },
  {
    title: 'Property Management',
    description: 'Professional property management services including tenant screening, maintenance, and asset upkeep.',
    icon: 'Key',
    features: [
      'Tenant screening and placement',
      'Rent collection and accounting',
      'Property maintenance and repairs',
      'Regular property inspections',
      'Asset performance optimization'
    ]
  },
  {
    title: 'Project Consultancy',
    description: 'Expert guidance during planning, development, and execution phases of real-estate projects.',
    icon: 'ClipboardList',
    features: [
      'Project planning and design',
      'Feasibility studies',
      'Development management',
      'Budget planning and control',
      'Risk assessment and mitigation'
    ]
  },
  {
    title: 'Construction',
    description: 'Quality construction services for renovations, remodeling, and new builds with exceptional craftsmanship.',
    icon: 'HardHat',
    features: [
      'New construction projects',
      'Renovations and remodeling',
      'Commercial and residential builds',
      'Quality assurance',
      'Timely project delivery'
    ]
  },
  {
    title: 'Airbnb & Short-Let Services',
    description: 'Complete management of short-term rental properties for hassle-free hosting.',
    icon: 'Home',
    features: [
      'Guest booking management',
      'Property cleaning and maintenance',
      'Guest communication',
      'Pricing optimization',
      'Review management'
    ]
  }
];

export const testimonials = [
  {
    name: 'Albert & Erika Johnson',
    role: 'Property Investors',
    content: 'Sequoia Projects made our property investment journey seamless. Their professionalism and attention to detail are unmatched. We highly recommend their services!',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80',
    rating: 5
  },
  {
    name: 'Pablo & Emma Martinez',
    role: 'First-Time Home Buyers',
    content: 'From our first viewing to moving in, the team at Sequoia Projects provided exceptional support. They truly understand what clients need and deliver beyond expectations.',
    image: 'https://images.unsplash.com/photo-1606122017369-d782bbb78f32?w=400&q=80',
    rating: 5
  }
];
