'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, Mail, Target, Award, Users, TrendingUp } from 'lucide-react';
import { teamMembers } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt="About us"
            fill
            className="object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
          >
            About Sequoia Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Building dreams, one property at a time since 2017
          </motion.p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                  alt="Our office"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                We Give You The Home In Your Vacation / Retreat
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                At SEQUOIA PROJECTS, we are your premier destination for comprehensive real estate
                services tailored to meet your property needs. Our properties are meticulously curated,
                blending sophistication and functionality to offer refined taste and exceptional service.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Since 2017, we have been committed to providing excellence in real estate management,
                construction, and consultancy services across Abuja and Nigeria.
              </p>
              <div className="bg-gray-50 border-l-4 border-[#3a3a41] p-4 sm:p-6 rounded-lg">
                <p className="text-[#3a3a41] font-semibold italic text-sm sm:text-base">
                  "Our mission is to transform the real estate experience by delivering
                  exceptional value, quality, and service to every client we serve."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: Target,
                title: 'Excellence',
                description: 'Committed to delivering the highest quality in every project and service'
              },
              {
                icon: Award,
                title: 'Integrity',
                description: 'Building trust through transparent and ethical business practices'
              },
              {
                icon: Users,
                title: 'Client-Focused',
                description: 'Your satisfaction and success are at the heart of what we do'
              },
              {
                icon: TrendingUp,
                title: 'Innovation',
                description: 'Embracing modern solutions to meet evolving real estate needs'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="h-8 w-8 text-[#3a3a41]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-[#3a3a41]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center text-white">
            {[
              { number: '8+', label: 'Years Experience' },
              { number: '50+', label: 'Properties Managed' },
              { number: '200+', label: 'Happy Clients' },
              { number: '30+', label: 'Projects Completed' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-200 text-sm sm:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to your success
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="relative h-64 sm:h-72 md:h-80">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-[#3a3a41] font-semibold mb-4">{member.role}</p>
                  <div className="space-y-2">
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-[#3a3a41] transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{member.phone}</span>
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-[#3a3a41] transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{member.email}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8">
              Let's discuss how we can help you achieve your real estate goals
            </p>
            <a
              href="/contact"
              className="inline-block bg-[#3a3a41] text-white px-6 sm:px-8 py-4 rounded-lg hover:bg-[#2a2a31] transition-all transform hover:scale-105 font-semibold"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
