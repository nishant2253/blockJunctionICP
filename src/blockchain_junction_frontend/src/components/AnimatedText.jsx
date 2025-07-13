import { motion } from 'framer-motion';

const AnimatedText = ({ text, className = "", delay = 0, variant = "default" }) => {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const glowVariants = {
    default: "",
    glow: "drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    rainbow: "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
  };

  return (
    <motion.div
      className={`${className} ${glowVariants[variant]}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          variants={wordVariants}
          whileHover={{
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2 }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedText;