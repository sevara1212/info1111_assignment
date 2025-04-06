"use client";

import { useState } from 'react';
import { FaPlus, FaTools, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import styles from './styles.module.css';

// Maintenance types
const maintenanceTypes = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Structural",
  "Pest Control",
  "Other"
];

type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'approved' | 'cancelled';

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  date: string;
}

interface FormData {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'low',
    status: 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: MaintenanceRequest = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString()
    };
    setRequests([...requests, newRequest]);
    setFormData({
      title: '',
      description: '',
      priority: 'low',
      status: 'pending'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as string
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Maintenance Requests</h1>
          <button className={styles.newRequestButton}>
            <FaPlus className={styles.buttonIcon} />
            New Request
          </button>
        </div>

        <div className={styles.requestList}>
          {requests.map(request => (
            <div key={request.id} className={styles.requestItem}>
              <div className={styles.requestHeader}>
                <h3 className={styles.requestTitle}>{request.title}</h3>
                <div className={`${styles.statusBadge} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
                  {request.status === 'pending' && <FaClock />}
                  {request.status === 'approved' && <FaCheck />}
                  {request.status === 'cancelled' && <FaTimes />}
                  <span>{request.status}</span>
                </div>
              </div>
              <p className={styles.requestDescription}>{request.description}</p>
              <div className={styles.requestMeta}>
                <span className={styles.priorityText}>Priority: {request.priority}</span>
                <span className={styles.dateText}>{new Date(request.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Submit New Request</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={styles.formInput}
                placeholder="Enter request title"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className={styles.formTextarea}
                placeholder="Describe the issue in detail"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={styles.formInput}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
