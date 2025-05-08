'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaSwimmingPool, 
  FaFileDownload, 
  FaElevator, 
  FaEnvelope, 
  FaTools,
  FaUsers,
  FaClipboardList
} from 'react-icons/fa';

const userNavItems = [
  { href: '/amenities', label: 'Amenities', icon: FaSwimmingPool },
  { href: '/downloads', label: 'Downloads', icon: FaFileDownload },
  { href: '/book-lift', label: 'Book Lift', icon: FaElevator },
  { href: '/contact', label: 'Contact', icon: FaEnvelope },
  { href: '/maintenance', label: 'Maintenance', icon: FaTools },
];

const adminNavItems = [
  { href: '/admin/maintenance', label: 'Maintenance Requests', icon: FaClipboardList },
  { href: '/admin/strata-roll', label: 'Strata Roll', icon: FaUsers },
  { href: '/admin/lift-bookings', label: 'Lift Bookings', icon: FaElevator },
];

export default function Navigation() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Strata Portal
              </Link>
            </div>
          </div>
          
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
} 