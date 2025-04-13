"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  FaUserCircle, 
  FaHome, 
  FaTools, 
  FaMoneyBillWave, 
  FaFileAlt, 
  FaPhone,
  FaArrowCircleUp
} from "react-icons/fa";
import styles from "./styles.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getGreeting = () => {
    const hour = currentTime.getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  };

  useEffect(() => {
    setLoading(false);
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const navItems = [
    { title: "Dashboard", icon: <FaHome />, link: "/dashboard" },
    { title: "Maintenance", icon: <FaTools />, link: "/maintenance" },
    { title: "Amenities", icon: <FaMoneyBillWave />, link: "/amenities" },
    { title: "Book Lift", icon: <FaArrowCircleUp />, link: "/book-lift" },
    { title: "Downloads", icon: <FaFileAlt />, link: "/downloads" },
    { title: "Contact", icon: <FaPhone />, link: "/contact" },
  ];

  const actionCards = [
    { 
      title: "Maintenance", 
      icon: <Image src="/images/maintenance.png" alt="Maintenance" width={80} height={80} className={styles.cardIcon} />, 
      link: "/maintenance" 
    },
    { 
      title: "Amenities", 
      icon: <Image src="/images/levies.jpg" alt="Amenities" width={80} height={80} className={styles.cardIcon} />, 
      link: "/amenities" 
    },
    { 
      title: "Book Lift", 
      icon: <Image src="/images/book.jpg" alt="Book Lift" width={80} height={80} className={styles.cardIcon} />, 
      link: "/book-lift" 
    },
    { 
      title: "Downloads", 
      icon: <Image src="/images/download.jpg" alt="Downloads" width={80} height={80} className={styles.cardIcon} />, 
      link: "/downloads" 
    },
    { 
      title: "Contact", 
      icon: <Image src="/images/pngtree-calling-telephone-line-icon-vector-png-image_1885981.jpg" alt="Contact" width={80} height={80} className={styles.cardIcon} />, 
      link: "/contact" 
    },
  ];

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.profileSection}>
          <FaUserCircle className={styles.profileIcon} />
          <h2 className={styles.profileName}>Sevara Ibragimova</h2>
          <p className={styles.profileEmail}>sevara.ibragimova@example.com</p>
        </div>
        <div className={styles.navMenu}>
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className={styles.navItem}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.dashboardSquare}>
          <div className={styles.textArea}>
            <h1 className={styles.welcomeText}>{getGreeting()}, Welcome to Sevara Apartments</h1>
            <p className={styles.dateText}>{format(currentTime, "EEEE, dd MMMM yyyy")}</p>
            <div className={styles.timeText}>
              {format(currentTime, "hh:mm a")}
            </div>
          </div>
          <div className={styles.imageArea}>
            <Image 
              src="https://article-assets.soho.com.au/articles/wp-content/uploads/2024/01/13205212/Infinity-1-1024x684.jpeg" 
              alt="Infinity Building" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={styles.dashboardImage}
            />
          </div>
        </div>

        <div className={styles.actionGrid}>
          {actionCards.map((card, index) => (
            <Link
              key={index}
              href={card.link}
              className={styles.actionCard}
            >
              {card.icon}
              <span>{card.title}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
