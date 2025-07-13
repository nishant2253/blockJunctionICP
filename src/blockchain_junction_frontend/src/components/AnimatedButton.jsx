import { motion } from 'framer-motion';
import { useState } from 'react';

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  className = "",
  disabled = false,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white/10 backdrop-blur-sm border border-white/20 text-white",
    outline: "border border-white/30 text-white hover:bg-white/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-xl font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={disabled ? {} : { 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={disabled ? {} : { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        animate={{
          x: isPressed ? "0%" : "-100%",
          opacity: isPressed ? 0.3 : 0,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={isPressed ? { 
          scale: 2, 
          opacity: [0, 0.3, 0],
        } : {}}
        transition={{ duration: 0.6 }}
      />
      
      {/* Button content */}
      <motion.span 
        className="relative z-10 flex items-center justify-center"
        animate={{
          y: isPressed ? 1 : 0,
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
      
      {/* Floating particles on hover */}
      {!disabled && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              initial={{ opacity: 0 }}
              whileHover={{
                opacity: [0, 1, 0],
                y: [0, -20],
                x: [0, Math.random() * 20 - 10],
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity,
              }}
              style={{
                left: `${30 + i * 20}%`,
                bottom: "10%",
              }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;