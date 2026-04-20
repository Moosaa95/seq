'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubmitContactInquiryMutation } from '@/lib/store/api/inquiryApi';

export default function ContactPage() {
  const [submitInquiry, { isLoading: loading, isSuccess: success, error: apiError, data: responseData }] = useSubmitContactInquiryMutation();
  const error = apiError ? (('data' in (apiError as any) ? (apiError as any).data.message || 'Failed to submit inquiry' : 'Failed to submit inquiry')) : null;
  const successMessage = responseData?.message;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Map frontend subject values to backend values
  const subjectMapping: Record<string, 'property' | 'management' | 'construction' | 'consultancy' | 'airbnb' | 'other'> = {
    'property-inquiry': 'property',
    'property-management': 'management',
    'construction': 'construction',
    'consultancy': 'consultancy',
    'short-let': 'airbnb',
    'other': 'other'
  };

  // Clear form after successful submission
  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: subjectMapping[formData.subject] || 'other',
        message: formData.message,
      }).unwrap();
    } catch (err) {
      console.error('Inquiry submission failed:', err);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[35vh] sm:min-h-[40vh] md:h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
            alt="Contact us"
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
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 px-4"
          >
            We'd love to hear from you
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 sm:space-y-8"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Reach out to us for any inquiries about our properties and services.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg">
                    <div className="bg-emerald-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Address</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Abuja, Nigeria<br />
                      Federal Capital Territory
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg">
                    <div className="bg-emerald-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Phone</h3>
                    <a
                      href="tel:+2348034567890"
                      className="text-gray-600 hover:text-emerald-600 transition-colors text-sm sm:text-base"
                    >
                      +234 803 456 7890
                    </a>
                  </div>

                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg">
                    <div className="bg-emerald-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Email</h3>
                    <a
                      href="mailto:info@seqprojects.com"
                      className="text-gray-600 hover:text-emerald-600 transition-colors text-sm sm:text-base break-all"
                    >
                      info@seqprojects.com
                    </a>
                  </div>

                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg">
                    <div className="bg-emerald-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Business Hours</h3>
                    <div className="text-gray-600 space-y-1 text-sm sm:text-base">
                      <p>Monday - Friday: 8am - 6pm</p>
                      <p>Saturday: 9am - 4pm</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-900">Submission Error</h3>
                        <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-emerald-900">Success!</h3>
                        <p className="text-sm text-emerald-700 mt-1">{successMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="+234 800 000 0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="property-inquiry">Property Inquiry</option>
                        <option value="property-management">Property Management</option>
                        <option value="construction">Construction Services</option>
                        <option value="consultancy">Project Consultancy</option>
                        <option value="short-let">Short-Let Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 sm:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Find Us</h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Visit our office in Abuja, Nigeria
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl h-[300px] sm:h-[400px] md:h-[500px] bg-gray-800"
          >
            {/* Placeholder for map - You can integrate Google Maps or another map service here */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-white text-xl font-semibold mb-2">Abuja, Nigeria</p>
                <p className="text-gray-400">Federal Capital Territory</p>
                <a
                  href="https://maps.google.com/?q=Abuja,Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
