import { motion } from 'framer-motion';

export const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Cloud Blob 1 - Pink, top-left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="cloud-blob"
        style={{
          width: '300px',
          height: '300px',
          top: '-50px',
          left: '-50px',
          background: 'hsl(330 100% 86%)',
        }}
      />

      {/* Cloud Blob 2 - Mint, bottom-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2, delay: 0.6 }}
        className="cloud-blob"
        style={{
          width: '250px',
          height: '250px',
          bottom: '100px',
          right: '-50px',
          background: 'hsl(170 80% 82%)',
          animationDelay: '-2s',
        }}
      />
    </div>
  );
};
