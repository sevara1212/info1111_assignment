"use client";

import Image from "next/image";
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import styles from './page.module.css';

const contacts = [
  {
    position: "Security",
    name: "Security Team",
    shortName: "CS",
    email: "security@sevara.apartments",
    phone: "04 0000 0001",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/security.png",
  },
  {
    position: "Strata Manager",
    name: "Strata Management",
    shortName: "SM",
    email: "stratamanager@sevara.apartments",
    phone: "04 0000 0002",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/stratamanager.png",
  },
  {
    position: "Building Manager",
    name: "Building Management",
    shortName: "CM",
    email: "buildingmanager@sevara.apartments",
    phone: "04 0000 0003",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/buildingmanager.png",
  },
  {
    position: "Chairperson",
    name: "Chairperson",
    shortName: "CH",
    email: "chairperson@sevara.apartments",
    phone: "04 0000 0004",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/chairperson.png",
  },
  {
    position: "Secretary",
    name: "Secretary",
    shortName: "SC",
    email: "secretary@sevara.apartments",
    phone: "04 0000 0005",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/secretary.png",
  },
  {
    position: "Treasurer",
    name: "Treasurer",
    shortName: "TR",
    email: "treasurer@sevara.apartments",
    phone: "04 0000 0006",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/treasurer.png",
  },
];

export default function ContactsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contact Our Team</h1>
        <p className={styles.subtitle}>Get in touch with our dedicated team members</p>
        
        <div className={styles.grid}>
          {contacts.map((contact) => (
            <div key={contact.position} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.imageContainer}>
                  <div className={styles.imageOverlay} />
                  <div className={styles.imageWrapper}>
                    <Image
                      src={contact.imageUrl}
                      alt={contact.position}
                      width={128}
                      height={128}
                      className={styles.image}
                    />
                  </div>
                </div>
                
                <h2 className={styles.name}>{contact.name}</h2>
                <p className={styles.position}>{contact.position}</p>
                
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <FaEnvelope className={styles.icon} />
                    <a 
                      href={`mailto:${contact.email}`}
                      className={styles.link}
                    >
                      {contact.email}
                    </a>
                  </div>
                  
                  {contact.phone !== "N/A" && (
                    <div className={styles.contactItem}>
                      <FaPhone className={styles.icon} />
                      <a 
                        href={`tel:${contact.phone}`}
                        className={styles.link}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
