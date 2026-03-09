import { motion } from 'framer-motion';

const BLOBS = [
  // Large pink — top-left
  { w: 280, h: 280, top: '-40px', left: '-60px', bg: 'hsl(330 100% 86%)', opacity: 0.65, blur: 50, delay: 0.3, dur: 10 },
  // Mint — bottom-right
  { w: 240, h: 240, bottom: '80px', right: '-40px', bg: 'hsl(170 80% 82%)', opacity: 0.6, blur: 50, delay: 0.6, dur: 12 },
  // Lavender — center-right
  { w: 200, h: 200, top: '30%', right: '10px', bg: 'hsl(270 60% 88%)', opacity: 0.55, blur: 45, delay: 1.0, dur: 14 },
  // Gold — bottom-left
  { w: 180, h: 180, bottom: '200px', left: '-30px', bg: 'hsl(42 90% 85%)', opacity: 0.5, blur: 45, delay: 0.8, dur: 11 },
  // Pink soft — top-right
  { w: 160, h: 160, top: '10%', right: '-20px', bg: 'hsl(340 80% 90%)', opacity: 0.5, blur: 40, delay: 1.2, dur: 13 },
];

const MICRO_BUBBLES = [
  { size: 40, top: '20%', left: '15%', bg: 'hsl(270 60% 88%)', opacity: 0.7, blur: 18, delay: 0.5, dur: 8 },
  { size: 30, top: '55%', right: '20%', bg: 'hsl(330 100% 86%)', opacity: 0.6, blur: 15, delay: 1.0, dur: 9 },
  { size: 50, bottom: '30%', left: '60%', bg: 'hsl(170 80% 82%)', opacity: 0.55, blur: 20, delay: 1.5, dur: 10 },
  { size: 35, top: '75%', left: '25%', bg: 'hsl(42 90% 85%)', opacity: 0.6, blur: 16, delay: 2.0, dur: 11 },
];

export const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {BLOBS.map((b, i) => (
        <motion.div
          key={`blob-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: b.opacity, scale: 1 }}
          transition={{ duration: 2, delay: b.delay }}
          className="cloud-blob"
          style={{
            width: b.w,
            height: b.h,
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            background: b.bg,
            filter: `blur(${b.blur}px)`,
            animationDuration: `${b.dur}s`,
            animationDelay: `-${i * 2}s`,
          }}
        />
      ))}

      {MICRO_BUBBLES.map((mb, i) => (
        <motion.div
          key={`micro-${i}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: mb.opacity, scale: 1 }}
          transition={{ duration: 1.5, delay: mb.delay }}
          style={{
            position: 'absolute',
            width: mb.size,
            height: mb.size,
            borderRadius: '50%',
            top: mb.top,
            bottom: mb.bottom,
            left: mb.left,
            right: mb.right,
            background: mb.bg,
            filter: `blur(${mb.blur}px)`,
            animation: `float ${mb.dur}s ease-in-out infinite`,
            animationDelay: `-${i * 3}s`,
          }}
        />
      ))}
    </div>
  );
};
