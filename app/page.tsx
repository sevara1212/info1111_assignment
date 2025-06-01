"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaUserShield, FaBuilding, FaShieldAlt, FaGem, FaStar, FaArrowRight, FaCheck, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <FaBuilding className="text-4xl" />,
      title: "Smart Building Management",
      description: "State-of-the-art technology for seamless living"
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Premium Security",
      description: "24/7 security with advanced access control"
    },
    {
      icon: <FaGem className="text-4xl" />,
      title: "Luxury Amenities",
      description: "World-class facilities at your fingertips"
    }
  ];

  const stats = [
    { number: "100+", label: "Luxury Residences" },
    { number: "24/7", label: "Concierge Service" },
    { number: "5★", label: "Premium Rating" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaBuilding className="text-3xl text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Sevara Apartments
            </span>
          </div>
          <div className="hidden md:flex space-x-8 text-white/80">
            <a href="#features" className="hover:text-purple-400 transition-colors duration-300">Features</a>
            <a href="#amenities" className="hover:text-purple-400 transition-colors duration-300">Amenities</a>
            <a href="#contact" className="hover:text-purple-400 transition-colors duration-300">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                LUXURY
              </span>
              <br />
              <span className="text-white">REDEFINED</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the pinnacle of modern living with our premium strata management platform. 
              Where technology meets luxury.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                href="/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center space-x-2">
                  <FaUser />
                  <span>Resident Portal</span>
                  <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                href="/admin/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center space-x-2">
                  <FaUserShield />
                  <span>Admin Portal</span>
                  <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center transform transition-all duration-700 delay-${index * 200} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/60 text-sm uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Premium Features
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Discover what makes Sevara Apartments the ultimate choice for luxury living
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 transition-all duration-500 transform hover:scale-105 hover:bg-white/15 ${
                  activeFeature === index ? 'ring-2 ring-purple-400 shadow-2xl shadow-purple-500/25' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-purple-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  World-Class Amenities
                </h2>
                <p className="text-xl text-white/80 mb-8">
                  Indulge in luxury amenities designed for the discerning resident
                </p>
                
                <div className="space-y-4">
                  {[
                    "Olympic-sized Swimming Pool",
                    "State-of-the-art Fitness Center", 
                    "Rooftop Garden & Lounge",
                    "24/7 Concierge Service",
                    "Private Cinema Room",
                    "Executive Business Center"
                  ].map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <FaCheck className="text-purple-400" />
                      <span className="text-white/90">{amenity}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href="/amenities"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold mt-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span>Explore Amenities</span>
                  <FaArrowRight />
                </Link>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <FaGem className="text-3xl text-purple-400 mb-3" />
                      <h4 className="text-white font-semibold">Premium Spa</h4>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <FaStar className="text-3xl text-blue-400 mb-3" />
                      <h4 className="text-white font-semibold">5-Star Service</h4>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <FaBuilding className="text-3xl text-emerald-400 mb-3" />
                      <h4 className="text-white font-semibold">Smart Building</h4>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <FaShieldAlt className="text-3xl text-pink-400 mb-3" />
                      <h4 className="text-white font-semibold">Elite Security</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Luxury?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            Join the exclusive community at Sevara Apartments. Contact us today to schedule your private tour.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <FaPhone className="text-3xl text-purple-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Call Us</h4>
              <p className="text-white/80">+1 (555) 123-4567</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <FaEnvelope className="text-3xl text-blue-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Email Us</h4>
              <p className="text-white/80">info@sevara.apartments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <FaMapMarkerAlt className="text-3xl text-emerald-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Visit Us</h4>
              <p className="text-white/80">Sydney, Australia</p>
            </div>
          </div>

          <Link 
            href="/contact"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <span>Schedule a Tour</span>
            <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FaBuilding className="text-2xl text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Sevara Apartments
            </span>
          </div>
          <p className="text-white/60 mb-6">
            © 2024 Sevara Apartments. All rights reserved. Experience luxury redefined.
          </p>
          <div className="flex justify-center space-x-6 text-white/60">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
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
