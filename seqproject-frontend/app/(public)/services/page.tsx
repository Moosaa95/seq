'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Key, ClipboardList, HardHat, Home, Check, ArrowRight } from 'lucide-react';
import { services } from '@/lib/data';

export default function ServicesPage() {
  const iconMap: Record<string, any> = {
    Building2,
    Key,
    ClipboardList,
    HardHat,
    Home
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] sm:min-h-[45vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
            alt="Our services"
            fill
            className="object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto px-4"
          >
            Comprehensive real estate solutions tailored to your needs
          </motion.p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From property management to construction, we provide end-to-end real estate services
              designed to exceed your expectations
            </p>
          </motion.div>

          <div className="space-y-20">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Building2;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`grid md:grid-cols-2 gap-12 items-center ${
                    !isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`${!isEven ? 'md:order-2' : ''}`}>
                    <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={
                          index === 0
                            ? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
                            : index === 1
                            ? 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80'
                            : index === 2
                            ? 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'
                            : index === 3
                            ? 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'
                            : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
                        }
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`${!isEven ? 'md:order-1' : ''}`}>
                    <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="bg-emerald-100 p-1 rounded-full mt-1 flex-shrink-0">
                            <Check className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-all font-semibold"
                    >
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Sequoia Projects?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We stand out in the real estate industry
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Experienced Team',
                description: 'Over 8 years of combined expertise in real estate and construction'
              },
              {
                title: 'Quality Assurance',
                description: 'Rigorous standards ensure exceptional results in every project'
              },
              {
                title: 'Client-Centric',
                description: 'Your satisfaction is our top priority from start to finish'
              },
              {
                title: 'Transparent Pricing',
                description: 'No hidden costs - clear and honest pricing for all services'
              },
              {
                title: 'Timely Delivery',
                description: 'We respect deadlines and ensure projects are completed on time'
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock assistance for all your property needs'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Contact us today to discuss how we can help with your real estate needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 font-semibold"
              >
                Contact Us
              </Link>
              <Link
                href="/properties"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-emerald-600 transition-all font-semibold"
              >
                View Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
