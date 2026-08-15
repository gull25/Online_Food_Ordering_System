import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Scroll-reveal helpers built on framer-motion.
 */

const EASE = [0.22, 1, 0.36, 1];

/** Reveals its children once, when they scroll into view. */
export const Reveal = ({
  children,
  className = '',
  delay = 0,
  y = 24,
  duration = 0.6,
  once = true,
  as = 'div',
  ...rest
}) => {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduceMotion) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
     
      viewport={{ once, margin: '0px 0px -80px 0px' }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
};


export const RevealGroup = ({
  children,
  className = '',
  stagger = 0.08,
  delay = 0,
  once = true,
  ...rest
}) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '0px 0px -60px 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const RevealItem = ({ children, className = '', y = 20, ...rest }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};


export const PageTransition = ({ children, className = '' }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
