import Link from 'next/link';
import { Building2, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-gray-300 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithLoader
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
          alt="Footer background"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#3a3a41] p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-base sm:text-xl text-white">SEQUOIA PROJECTS</div>
                <div className="text-xs text-gray-400">LTD</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Your premier destination for comprehensive real estate services tailored to meet your property needs.
            </p>
            <p className="text-xs sm:text-sm text-gray-300 font-semibold">Since 2017</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs sm:text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-xs sm:text-sm hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-xs sm:text-sm hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs sm:text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-xs sm:text-sm">Real Estate</li>
              <li className="text-xs sm:text-sm">Property Management</li>
              <li className="text-xs sm:text-sm">Project Consultancy</li>
              <li className="text-xs sm:text-sm">Construction</li>
              <li className="text-xs sm:text-sm">Airbnb & Short-Let</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">Abuja, Nigeria</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm">+234 803 456 7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm break-all">info@seqprojects.com</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-4 sm:mt-6">
              <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Follow Us</h4>
              <div className="flex space-x-2 sm:space-x-3">
                <a href="#" className="bg-gray-800 p-1.5 sm:p-2 rounded-lg hover:bg-[#3a3a41] transition-colors">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-1.5 sm:p-2 rounded-lg hover:bg-[#3a3a41] transition-colors">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-1.5 sm:p-2 rounded-lg hover:bg-[#3a3a41] transition-colors">
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="bg-gray-800 p-1.5 sm:p-2 rounded-lg hover:bg-[#3a3a41] transition-colors">
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Sequoia Projects Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
