import { motion } from "framer-motion";

export default function ComingSoon() {
  return (
    <div className="container-page">
      <div className="relative h-screen flex items-center justify-center overflow-hidden text-gray-900">

        {/* DOT BACKGROUND */}
        <div className="">
          <div className="w-full h-full rounded-full
            bg-[radial-gradient(circle,_rgba(99,102,241,0.35)_1px,_transparent_1px)]
            bg-[size:10px_10px]">
          </div>
        </div>

        {/* ORBIT ANIMATION */}
        <svg className="absolute w-[700px] h-[700px]" viewBox="0 0 600 600">

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

          <defs>
            <linearGradient id="grad1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="grad2">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>

        {/* CONTENT */}
        <div className="relative z-10 text-center">

          {/* Coming Soon - smaller size */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="flex items-center justify-center text-[48px]"
          >
            <span className="text-gray-800 font-[100]">Coming</span>
            <span className="text-blue-600 font-[100]">&nbsp;Soon</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <h2 className="text-base font-semibold text-gray-900 mt-3">
              We're Working On Something Great
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Our website is under construction. Stay tuned!
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}