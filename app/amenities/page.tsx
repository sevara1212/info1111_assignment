"use client";

import Image from "next/image";
import { FaClock } from "react-icons/fa";

export default function AmenitiesPage() {
  const amenities = [
    {
      name: "Swimming Pool",
      description: "Our luxurious swimming pool is perfect for both exercise and relaxation. Featuring temperature-controlled water and dedicated lap lanes.",
      image: "public/images/poolindoor.png",
      hours: "6:00 AM - 10:00 PM",
      features: ["Temperature Controlled", "Lap Lanes", "Pool Deck", "Shower Facilities"]
    },
    {
      name: "Gymnasium",
      description: "State-of-the-art gym equipped with cardio machines, free weights, and dedicated areas for stretching and functional training.",
      image: "public/images/gym.png",
      hours: "24/7 Access",
      features: ["Modern Equipment", "Cardio Area", "Free Weights", "Personal Training"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12 gradient-border">
          Building Amenities
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {amenities.map((amenity, index) => (
            <div key={index} className="card overflow-hidden">
              <div className="relative h-[500px] w-full">
                <Image
                  src={amenity.image}
                  alt={amenity.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {amenity.name}
                </h2>
                
                <p className="text-muted mb-6">
                  {amenity.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {amenity.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center text-muted">
                  <FaClock className="mr-2" />
                  <span className="text-sm">Hours: {amenity.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
