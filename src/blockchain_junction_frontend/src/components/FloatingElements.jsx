import { motion } from 'framer-motion';
import { SparklesIcon, CubeIcon, StarIcon } from '@heroicons/react/24/outline';

const FloatingElements = () => {
  return (
    <>
      {/* 3D Floating Icons */}
      <motion.div
        className="absolute top-20 left-20 z-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-12 h-12 bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
          <SparklesIcon className="w-6 h-6 text-blue-400" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-40 right-32 z-10"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -15, 15, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
          <CubeIcon className="w-5 h-5 text-purple-400" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-40 z-10"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 20, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 shadow-lg">
          <StarIcon className="w-4 h-4 text-cyan-400" />
        </div>
      </motion.div>

      {/* Animated Lines */}
      <motion.div
        className="absolute top-1/4 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
        animate={{
          scaleY: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/3 w-24 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
        animate={{
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />

      {/* Pulsing Dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-white/30 rounded-full"
          style={{
            left: `${30 + i * 20}%`,
            top: `${60 + i * 5}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  );
};

export default FloatingElements;