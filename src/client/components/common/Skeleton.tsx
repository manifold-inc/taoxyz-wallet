import { motion } from 'framer-motion';

const Skeleton = ({ className }: { className: string }) => {
  return (
    <motion.div
      className={`bg-mf-ash-500 rounded-md ${className}`}
      animate={{
        opacity: [0.8, 0.5, 0.8],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export default Skeleton;
