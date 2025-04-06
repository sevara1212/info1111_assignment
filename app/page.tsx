"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">{format(currentTime, "EEEE, dd MMMM yyyy")}</p>
        </div>
        <div className="text-xl font-semibold text-blue-600">
          {format(currentTime, "hh:mm:ss a")}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { title: "Submit a Maintenance Request", color: "bg-red-100", link: "/maintenance" },
          { title: "View Levies", color: "bg-green-100", link: "/levies" },
          { title: "Download Documents", color: "bg-blue-100", link: "/documents" },
          { title: "Contact Staff", color: "bg-yellow-100", link: "/contact" },
        ].map((card, index) => (
          <a
            key={index}
            href={card.link}
            className={`${card.color} p-6 rounded-lg shadow-md text-center font-semibold transition-transform transform hover:scale-105`}
          >
            {card.title}
          </a>
        ))}
      </div>

      {/* Calendar */}
      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold">Today's Date</h2>
        <p className="text-gray-600 text-lg">{format(currentTime, "EEEE, dd MMMM yyyy")}</p>
      </div>
    </div>
  );
}
