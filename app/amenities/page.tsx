"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";

export default function Amenities() {
  const [apartment, setApartment] = useState("");
  const [eligible, setEligible] = useState<boolean | null>(null);

  const amenities = [
    {
      name: "Indoor Swimming Pool",
      image: "/images/poolindoor.png",
      description: "Luxurious heated indoor swimming pool with dedicated lap lanes and relaxation area",
      hours: "6:00 AM - 10:00 PM",
      features: ["Temperature controlled", "Change rooms", "Shower facilities", "Pool loungers"]
    },
    {
      name: "Fitness Center",
      image: "/images/gym.png",
      description: "State-of-the-art fitness center featuring cardio equipment and weight training area",
      hours: "24/7 Access",
      features: ["Modern equipment", "Free weights", "Cardio machines", "Personal training area"]
    }
  ];

  function checkEligibility() {
    const aptNumber = parseInt(apartment, 10);
    const floor = Math.floor(aptNumber / 100);
    if (floor >= 5 && floor <= 50) {
      setEligible(true);
    } else {
      setEligible(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Premium Building Amenities</h1>
        
        <div className={styles.amenitiesGrid}>
          {amenities.map((amenity, index) => (
            <div key={index} className={styles.amenityCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={amenity.image}
                  alt={amenity.name}
                  width={400}
                  height={500}
                  className={styles.amenityImage}
                />
              </div>
              <div className={styles.amenityContent}>
                <h3 className={styles.amenityName}>{amenity.name}</h3>
                <p className={styles.amenityDescription}>{amenity.description}</p>
                <div className={styles.amenityFeatures}>
                  {amenity.features.map((feature, idx) => (
                    <span key={idx} className={styles.featureTag}>{feature}</span>
                  ))}
                </div>
                <p className={styles.amenityHours}>
                  <span className={styles.hoursLabel}>Operating Hours:</span> {amenity.hours}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.eligibilitySection}>
          <h2 className={styles.subtitle}>Check Your Access</h2>
          <div className={styles.eligibilityForm}>
            <input
              type="text"
              placeholder="Enter Apartment Number"
              className={styles.input}
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
            <button
              onClick={checkEligibility}
              className={styles.button}
            >
              Check Access
            </button>
          </div>

          {eligible !== null && (
            <div className={styles.eligibilityResult}>
              {eligible ? (
                <div className={styles.successMessage}>
                  ✅ You have access to all amenities!
                  <p className={styles.accessNote}>Please use your key fob to access the facilities.</p>
                </div>
              ) : (
                <div className={styles.errorMessage}>
                  ❌ Only floors 5–50 have amenities access.
                  <p className={styles.accessNote}>Please contact building management for more information.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
