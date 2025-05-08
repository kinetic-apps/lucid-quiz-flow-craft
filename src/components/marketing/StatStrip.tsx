
import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

type StatProps = {
  value: number;
  label: string;
  suffix?: string;
};

const CountUp = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = Math.min(value, 9999);
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        setCount(Math.min(Math.floor(start), end));
        
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Stat = ({ value, label, suffix }: StatProps) => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-4xl font-bold text-gray-900 mb-2">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="text-gray-600">{label}</div>
    </motion.div>
  );
};

const StatStrip = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value={25000} label="Happy Users" suffix="+" />
          <Stat value={98} label="Satisfaction Rate" suffix="%" />
          <Stat value={15} label="Personalized Insights" suffix="+" />
          <Stat value={2} label="Minute Quiz" />
        </div>
      </div>
    </div>
  );
};

export default StatStrip;
