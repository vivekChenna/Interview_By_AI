import { motion } from "framer-motion";

const AudioWave = () => {
  return (
    <div className=" flex flex-col items-center gap-2.5">
      <div className="flex gap-1.5 items-center">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-gray-800 rounded-full"
          animate={{
            height: ["6px", "16px", "6px"], // Reduced height variation
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.07, // Faster stagger effect
          }}
          style={{ width: "2px" }} // Reduced width
        />
      ))}
      </div>
      <p>Capturing Audio</p>
    </div>
  );
};

export default AudioWave;
