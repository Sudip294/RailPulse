import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const SplitText = ({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  stagger = 0.03,
  once = true,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [inView, controls, once]);

  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex overflow-hidden">
          {word.split('').map((char, ci) => (
            <motion.span
              key={ci}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { y: '110%', opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              transition={{
                duration,
                delay: delay + (wi * word.length + ci) * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block will-change-transform"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

export default SplitText;
