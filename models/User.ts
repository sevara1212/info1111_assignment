export interface User {
  id: string;
  name: string;
  email: string;
  apartment: number;
  floor: number;
  role: 'resident' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  name: string;
  email: string;
  apartment: number;
  floor: number;
  role: 'resident' | 'admin';
} 