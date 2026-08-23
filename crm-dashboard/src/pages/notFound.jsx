import React from "react";

export default function NotFound() {
    const SwirlIcon = ({ size = 90, color = "#4f46e5" }) => {
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Arc 1 */}
            <path
              d="M50 10 A40 40 0 0 1 85 45"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
      
            {/* Arc 2 */}
            <path
              d="M85 55 A40 40 0 0 1 50 90"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
      
            {/* Arc 3 */}
            <path
              d="M50 90 A40 40 0 0 1 15 55"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
      
            {/* Arc 4 */}
            <path
              d="M15 45 A40 40 0 0 1 50 10"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
      
            {/* Inner swirl */}
            <path
              d="M50 30 A20 20 0 0 1 70 50"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M70 50 A20 20 0 0 1 50 70"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M50 70 A20 20 0 0 1 30 50"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        );
      };
  return (
      <div className="container-page">
          
          <div className="relative h-screen flex items-center justify-center overflow-hidden text-gray-900">

      {/* LEFT DOT WAVE */}
      <div className="">
        <div className="w-full h-full rounded-full 
          bg-[radial-gradient(circle,_rgba(99,102,241,0.35)_1px,_transparent_1px)]
          bg-[size:10px_10px]">
        </div>
      </div>

      {/* RIGHT ORBIT ANIMATION */}
      <svg className="absolute w-[700px] h-[700px]" viewBox="0 0 600 600">
        
        {/* MAIN ARC */}
        <path
          d="M100,300 a200,200 0 1,1 400,0"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="2"
          strokeDasharray="5 10"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 300 300"
            to="360 300 300"
            dur="14s"
            repeatCount="indefinite"
          />
        </path>

        {/* SECOND ARC */}
        <path
          d="M120,300 a180,180 0 1,0 360,0"
          fill="none"
          stroke="url(#grad2)"
          strokeWidth="2"
          strokeDasharray="3 8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 300 300"
            to="0 300 300"
            dur="18s"
            repeatCount="indefinite"
          />
        </path>

        {/* DOT MOVEMENT */}
        {/* <circle r="4" fill="#6366f1">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M100,300 a200,200 0 1,1 400,0"
          />
        </circle> */}

        {/* GRADIENT */}
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="grad2">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      {/* CONTENT */}
      <div className="relative z-10 text-center">

        {/* 404 */}
        <h1 className="flex items-center justify-center text-[110px] ">
          <span className="text-gray-800 font-[100]">4</span>

          {/* SPIRAL */}
          {/* <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            className="animate-spin"
          >
            <path
              d="M50 10
                 a40 40 0 1 1 -0.1 0
                 M50 30
                 a20 20 0 1 0 0.1 0"
              stroke="#2563eb"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </svg> */}
 <span className="text-blue-600 font-[100]">0</span>
          <span className="text-gray-800 font-[100]">4</span>
        </h1>

        {/* TEXT */}
        <h2 className="text-2xl  mt-4">
          Page Not Found
        </h2>

        <p className="text-gray-500 mt-2">
          Sorry, we couldn't find the page you're looking for.
        </p>

        {/* BUTTON */}
        <button className="mt-6 px-2 py-1 rounded-md bg-[#2563eb] text-white hover:bg-blue-700 transition shadow-md text-sm">
        ←   Back To Home
        </button>
      </div>
    </div>
    </div>
  );
}