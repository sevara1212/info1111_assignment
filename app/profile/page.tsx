"use client";

import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaUserShield, FaBuilding, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

interface ProfileData {
  unit: string;
  name: string;
  email: string;
  username: string;
  residentType: string;
  mobileNumber: string;
  secondaryNumber: string;
  emergencyContact: string;
  emergencyContactNumber: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    unit: 'E2110.1',
    name: '',
    email: '',
    username: '',
    residentType: '',
    mobileNumber: '',
    secondaryNumber: '',
    emergencyContact: '',
    emergencyContactNumber: ''
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial profile data (you would typically fetch this from an API)
  useEffect(() => {
    // Simulate loading profile data
    const loadProfile = async () => {
      try {
        // Here you would typically fetch the profile data from your backend
        const mockProfile = {
          unit: 'E2110.1',
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          residentType: 'owner',
          mobileNumber: '+1234567890',
          secondaryNumber: '+0987654321',
          emergencyContact: 'Jane Doe',
          emergencyContactNumber: '+1122334455'
        };
        setProfile(mockProfile);
      } catch (error) {
        setErrorMessage('Failed to load profile data');
      }
    };

    loadProfile();
  }, []);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    try {
      // Here you would typically send the data to your backend
      console.log('Saving profile data:', profile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            <FaArrowLeft className={styles.backIcon} />
            Back to Dashboard
          </button>
          <h1 className={styles.title}>Edit Profile</h1>
        </div>
        
        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaBuilding className={styles.sectionIcon} />
              Unit Information
            </h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={profile.unit}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaUser className={styles.sectionIcon} />
              Personal Information
            </h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="residentType">Resident Type</label>
                <select
                  id="residentType"
                  name="residentType"
                  value={profile.residentType}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                >
                  <option value="">Select type</option>
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="family">Family Member</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaPhone className={styles.sectionIcon} />
              Contact Information
            </h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={profile.mobileNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="secondaryNumber">Secondary Number</label>
                <input
                  type="tel"
                  id="secondaryNumber"
                  name="secondaryNumber"
                  value={profile.secondaryNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaUserShield className={styles.sectionIcon} />
              Emergency Contact
            </h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label htmlFor="emergencyContact">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="emergencyContactNumber">Emergency Contact Number</label>
                <input
                  type="tel"
                  id="emergencyContactNumber"
                  name="emergencyContactNumber"
                  value={profile.emergencyContactNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 