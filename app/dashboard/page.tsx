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
    { title: 'Dashboard', icon: <FaHome />, link: '/' },
    { title: 'Amenities', icon: <FaSwimmingPool />, link: '/amenities' },
    { title: 'Downloads', icon: <FaFileAlt />, link: '/downloads' },
    { title: 'Book Lift', icon: <FaArrowCircleUp />, link: '/book-lift' },
  ];

  const actionCards = [
    {
      title: 'Amenities',
      icon: <Image src="/images/pool.jpg" alt="Amenities" width={80} height={80} className={styles.cardIcon} />,
      link: '/amenities'
    },
    {
      title: 'Downloads',
      icon: <Image src="/images/downloads.jpg" alt="Downloads" width={80} height={80} className={styles.cardIcon} />,
      link: '/downloads'
    },
    {
      title: 'Book Lift',
      icon: <Image src="/images/book.jpg" alt="Book Lift" width={80} height={80} className={styles.cardIcon} />,
      link: '/book-lift'
    }
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.profileSection}>
          <FaUser className={styles.profileIcon} />
          <h2 className={styles.profileName}>Welcome Back</h2>
          <p className={styles.profileEmail}>Resident Portal</p>
        </div>
        <div className={styles.navMenu}>
          {navigationItems.map((item, index) => (
            <Link href={item.link} key={index} className={styles.navItem}>
              <span className={styles.navIcon}>{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.dashboardSquare}>
          <div className={styles.textArea}>
            <h1 className={styles.welcomeText}>{greeting}</h1>
            <p className={styles.dateText}>{currentDate}</p>
            <p className={styles.timeText}>{currentTime}</p>
          </div>
          <div className={styles.imageArea}>
            <Image
              src="/images/building.jpg"
              alt="Building"
              fill
              priority
              className={styles.dashboardImage}
            />
          </div>
        </div>

        <div className={styles.actionGrid}>
          {actionCards.map((card, index) => (
            <Link href={card.link} key={index} className={styles.actionCard}>
              {card.icon}
              <span>{card.title}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
