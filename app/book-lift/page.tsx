"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { FaArrowCircleUp, FaClock, FaBuilding } from "react-icons/fa";

export default function BookLift() {
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    try {
      const res = await fetch("/api/edge/book-lift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          unit: parseInt(unit), 
          date,
          time,
          duration: parseInt(duration)
        })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        message: "An error occurred while booking the lift."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <FaArrowCircleUp className={styles.titleIcon} />
          Book Lift
        </h1>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="unit">
                Unit Number
              </label>
              <input
                type="text"
                id="unit"
                className={styles.input}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Enter your unit number"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="time">
                Time
              </label>
              <input
                type="time"
                id="time"
                className={styles.input}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="duration">
                Duration (minutes)
              </label>
              <select
                id="duration"
                className={styles.input}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Lift'}
            </button>
          </form>

          {response && (
            <div className={response.success ? styles.successMessage : styles.errorMessage}>
              {response.message}
            </div>
          )}
        </div>

        <div className={styles.guidelines}>
          <h3>Booking Guidelines</h3>
          <ul>
            <li>Bookings can be made up to 7 days in advance</li>
            <li>Minimum booking duration is 30 minutes</li>
            <li>Maximum booking duration is 2 hours</li>
            <li>Please arrive 5 minutes before your scheduled time</li>
            <li>Cancellations must be made at least 2 hours in advance</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 