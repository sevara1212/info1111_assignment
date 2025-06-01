"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaUserShield, FaBuilding, FaShieldAlt, FaLeaf, FaStar, FaArrowRight, FaCheck, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsVisible(true);
    
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const quickAccess = [
    {
      icon: <FaBuilding className="text-4xl" />,
      title: "Building Services",
      description: "Maintenance, bookings, and facility access"
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Security & Access",
      description: "Key cards, visitor access, and security updates"
    },
    {
      icon: <FaLeaf className="text-4xl" />,
      title: "Community Info",
      description: "Events, notices, and resident communications"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-100/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.08), rgba(148, 163, 184, 0.08))' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaBuilding className="text-3xl text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">
              Sevara Apartments
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-slate-600">
            <div className="flex items-center space-x-2">
              <FaClock className="text-blue-600" />
              <span className="font-medium">{currentTime}</span>
            </div>
            <a href="#services" className="hover:text-blue-600 transition-colors duration-300">Services</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors duration-300">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-slate-800">
              Welcome Back
            </h1>
            <p className="text-xl md:text-2xl mb-16 max-w-4xl mx-auto leading-relaxed text-slate-600">
              Access your resident portal to manage your apartment services, view community updates, 
              and connect with building management.
            </p>
            
            {/* Portal Access Buttons */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-20">
              <Link 
                href="/resident/login"
                className="group relative px-12 py-8 text-white rounded-2xl font-bold text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 min-w-[320px] bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <div className="flex flex-col items-center space-y-3">
                  <FaUser className="text-5xl" />
                  <span>Resident Portal</span>
                  <span className="text-sm font-normal opacity-90">Maintenance • Amenities • Documents</span>
                  <FaArrowRight className="transform group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
              
              <Link 
                href="/admin/login"
                className="group relative px-12 py-8 text-white rounded-2xl font-bold text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 min-w-[320px] bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
              >
                <div className="flex flex-col items-center space-y-3">
                  <FaUserShield className="text-5xl" />
                  <span>Admin Portal</span>
                  <span className="text-sm font-normal opacity-90">Management • Analytics • Reports</span>
                  <FaArrowRight className="transform group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section id="services" className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-800">
              Quick Access
            </h2>
            <p className="text-xl text-slate-600">
              Common services and information for residents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {quickAccess.map((item, index) => (
              <div 
                key={index}
                className="rounded-2xl p-8 border transition-all duration-300 transform hover:scale-105 shadow-lg bg-white/80 backdrop-blur-xl border-slate-200 hover:bg-white hover:shadow-xl hover:border-blue-200"
              >
                <div className="mb-6 text-center text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-slate-800">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-center text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building Amenities */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl p-12 border shadow-xl bg-white/80 backdrop-blur-xl border-slate-200">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-slate-800">
                  Building Amenities
                </h2>
                <p className="text-xl mb-8 text-slate-600">
                  Available facilities for all residents
                </p>
                
                <div className="space-y-4">
                  {[
                    "Swimming Pool",
                    "Fitness Center", 
                    "24/7 Concierge Service"
                  ].map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <FaCheck className="text-blue-600" />
                      <span className="font-medium text-lg text-slate-800">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl p-6 border bg-blue-50 border-blue-200">
                      <FaLeaf className="text-3xl mb-3 text-blue-600" />
                      <h4 className="font-semibold text-slate-800">Pool Access</h4>
                    </div>
                    <div className="rounded-2xl p-6 border bg-slate-50 border-slate-200">
                      <FaStar className="text-3xl mb-3 text-slate-600" />
                      <h4 className="font-semibold text-slate-800">Concierge</h4>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="rounded-2xl p-6 border bg-blue-50 border-blue-200">
                      <FaBuilding className="text-3xl mb-3 text-blue-600" />
                      <h4 className="font-semibold text-slate-800">Fitness Center</h4>
                    </div>
                    <div className="rounded-2xl p-6 border bg-slate-50 border-slate-200">
                      <FaShieldAlt className="text-3xl mb-3 text-slate-600" />
                      <h4 className="font-semibold text-slate-800">Security</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-800">
            Building Contact Information
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-slate-600">
            Need assistance? Contact our building management team or concierge service.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="rounded-2xl p-6 border shadow-lg bg-white/90 backdrop-blur-xl border-slate-200 hover:border-blue-200 transition-colors">
              <FaPhone className="text-3xl mx-auto mb-4 text-blue-600" />
              <h4 className="font-semibold mb-2 text-slate-800">Emergency & Concierge</h4>
              <p className="text-lg font-medium text-slate-600">0400 000 000</p>
            </div>
            <div className="rounded-2xl p-6 border shadow-lg bg-white/90 backdrop-blur-xl border-slate-200 hover:border-blue-200 transition-colors">
              <FaEnvelope className="text-3xl mx-auto mb-4 text-blue-600" />
              <h4 className="font-semibold mb-2 text-slate-800">Building Management</h4>
              <p className="text-slate-600">info@sevara.apartments</p>
            </div>
            <div className="rounded-2xl p-6 border shadow-lg bg-white/90 backdrop-blur-xl border-slate-200 hover:border-blue-200 transition-colors">
              <FaMapMarkerAlt className="text-3xl mx-auto mb-4 text-slate-600" />
              <h4 className="font-semibold mb-2 text-slate-800">Location</h4>
              <p className="text-slate-600">Pyrmont, Sydney NSW</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t bg-white/90 backdrop-blur-xl border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FaBuilding className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-slate-800">
              Sevara Apartments
            </span>
          </div>
          <p className="mb-6 text-slate-600">
            © 2025 Sevara Apartments. All rights reserved. Resident portal and building management system.
          </p>
          <div className="flex justify-center space-x-6 text-slate-600">
            <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-blue-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
