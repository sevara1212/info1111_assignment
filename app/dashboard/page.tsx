"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaHome, FaSwimmingPool, FaFileAlt, FaArrowCircleUp } from "react-icons/fa";
import styles from "./styles.module.css";

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Set greeting based on time of day
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      // Format time
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      }));

      // Format date
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { title: 'Dashboard', icon: <FaHome className="text-xl" />, link: '/' },
    { title: 'Amenities', icon: <FaSwimmingPool className="text-xl" />, link: '/amenities' },
    { title: 'Downloads', icon: <FaFileAlt className="text-xl" />, link: '/downloads' },
    { title: 'Book Lift', icon: <FaArrowCircleUp className="text-xl" />, link: '/book-lift' },
  ];

  const actionCards = [
    {
      title: 'Amenities',
      icon: <div className="relative w-20 h-20 mb-4">
              <Image src="/images/poolindoor.png" alt="Amenities" fill className="object-cover rounded-lg" />
            </div>,
      link: '/amenities'
    },
    {
      title: 'Downloads',
      icon: <div className="relative w-20 h-20 mb-4">
              <Image src="/images/download.jpg" alt="Downloads" fill className="object-cover rounded-lg" />
            </div>,
      link: '/downloads'
    },
    {
      title: 'Book Lift',
      icon: <div className="relative w-20 h-20 mb-4">
              <Image src="/images/book.jpg" alt="Book Lift" fill className="object-cover rounded-lg" />
            </div>,
      link: '/book-lift'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 h-full w-72 bg-white shadow-soft-xl p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-primary text-2xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-muted">Resident Portal</p>
        </div>
        <div className="space-y-2">
          {navigationItems.map((item, index) => (
            <Link 
              href={item.link} 
              key={index} 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary transition-all"
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="ml-72 p-8">
        <div className="card p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting}</h1>
              <p className="text-muted mb-1">{currentDate}</p>
              <p className="text-2xl font-semibold text-gray-900">{currentTime}</p>
            </div>
            <div className="relative w-96 h-48 rounded-xl overflow-hidden">
              <Image
                src="/images/building.png"
                alt="Building"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => (
            <Link href={card.link} key={index} className="card p-6 flex flex-col items-center justify-center hover:scale-105">
              {card.icon}
              <span className="text-lg font-medium text-gray-900">{card.title}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
