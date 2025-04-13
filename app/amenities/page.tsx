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
    },
    {
      name: "Fitness Center",
      image: "/images/gym.png",
      description: "State-of-the-art fitness center featuring cardio equipment and weight training area",
      hours: "24/7 Access",
    }
  ];

  const checkEligibility = () => {
    try {
      const aptNumber = parseInt(apartment, 10);
      if (isNaN(aptNumber)) {
        setEligible(false);
        return;
      }
      const floor = Math.floor(aptNumber / 100);
      setEligible(floor >= 5 && floor <= 50);
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setEligible(false);
    }
  };

  return (
    <main className={styles.container}>
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
                  priority={index === 0}
                  unoptimized={true}
                />
              </div>
              <div className={styles.amenityContent}>
                <h3 className={styles.amenityName}>{amenity.name}</h3>
                <p className={styles.amenityDescription}>{amenity.description}</p>
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
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <button
              onClick={checkEligibility}
              className={styles.button}
              type="button"
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
    </main>
  );
}
