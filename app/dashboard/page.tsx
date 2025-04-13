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

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  sidebar: {
    width: '20%',
    padding: '1.5rem',
    backgroundColor: '#1f2937',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#ffffff',
  },
  profileIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#ffffff',
  },
  profileName: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#ffffff',
  },
  profileEmail: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  navMenu: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#374151',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #ffffff',
    transition: 'background-color 0.2s',
    color: '#ffffff',
    textDecoration: 'none',
  },
  navIcon: {
    fontSize: '1.25rem',
    color: '#ffffff',
  },
  mainContent: {
    flex: 1,
    padding: '1.5rem',
    backgroundColor: '#ffffff',
  },
  dashboardSquare: {
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '18rem',
    position: 'relative',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem',
  },
  textArea: {
    width: '50%',
  },
  welcomeText: {
    fontSize: '2.25rem',
    fontWeight: 700,
    color: '#000000',
  },
  dateText: {
    color: '#6b7280',
    fontSize: '1.125rem',
    marginTop: '0.5rem',
  },
  timeText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#4b5563',
    marginTop: '0.5rem',
  },
  imageArea: {
    width: '50%',
    height: '100%',
    position: 'relative',
  },
  dashboardImage: {
    borderRadius: '0.5rem',
    objectFit: 'cover',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginTop: '2rem',
    padding: '0 1rem',
  },
  actionCard: {
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '1.125rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#000000',
    transition: 'transform 0.2s',
    height: '12.5rem',
    textDecoration: 'none',
  },
  cardIcon: {
    marginBottom: '1rem',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#374151',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #ffffff',
    transition: 'background-color 0.2s',
    color: '#ffffff',
    width: '100%',
    cursor: 'pointer',
  },
} as const;

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
      icon: <Image src="/images/maintenance.png" alt="Maintenance" width={80} height={80} style={styles.cardIcon} />, 
      link: "/maintenance" 
    },
    { 
      title: "Amenities", 
      icon: <Image src="/images/levies.jpg" alt="Amenities" width={80} height={80} style={styles.cardIcon} />, 
      link: "/amenities" 
    },
    { 
      title: "Book Lift", 
      icon: <Image src="/images/book.jpg" alt="Book Lift" width={80} height={80} style={styles.cardIcon} />, 
      link: "/book-lift" 
    },
    { 
      title: "Downloads", 
      icon: <Image src="/images/download.jpg" alt="Downloads" width={80} height={80} style={styles.cardIcon} />, 
      link: "/downloads" 
    },
    { 
      title: "Contact", 
      icon: <Image src="/images/pngtree-calling-telephone-line-icon-vector-png-image_1885981.jpg" alt="Contact" width={80} height={80} style={styles.cardIcon} />, 
      link: "/contact" 
    },
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.profileSection}>
          <FaUserCircle style={styles.profileIcon} />
          <h2 style={styles.profileName}>Sevara Ibragimova</h2>
          <p style={styles.profileEmail}>sevara.ibragimova@example.com</p>
        </div>
        <div style={styles.navMenu}>
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              style={styles.navItem}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </aside>

      <main style={styles.mainContent}>
        <div style={styles.dashboardSquare}>
          <div style={styles.textArea}>
            <h1 style={styles.welcomeText}>{getGreeting()}, Welcome to Sevara Apartments</h1>
            <p style={styles.dateText}>{format(currentTime, "EEEE, dd MMMM yyyy")}</p>
            <div style={styles.timeText}>
              {format(currentTime, "hh:mm a")}
            </div>
          </div>
          <div style={styles.imageArea}>
            <Image 
              src="https://article-assets.soho.com.au/articles/wp-content/uploads/2024/01/13205212/Infinity-1-1024x684.jpeg" 
              alt="Infinity Building" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              style={styles.dashboardImage}
            />
          </div>
        </div>

        <div style={styles.actionGrid}>
          {actionCards.map((card, index) => (
            <Link
              key={index}
              href={card.link}
              style={styles.actionCard}
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
