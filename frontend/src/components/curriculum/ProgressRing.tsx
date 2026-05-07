import { motion } from 'framer-motion';

interface Props {
  percent: number;
  size?:   number;
  stroke?: number;
}

export const ProgressRing = ({ percent, size = 52, stroke = 5 }: Props) => {
  const radius      = (size - stroke) / 2;
  const circ        = 2 * Math.PI * radius;
  const offset      = circ - (percent / 100) * circ;
  const cx          = size / 2;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={cx} cy={cx} r={radius} fill="none" stroke="#2e2e5a" strokeWidth={stroke} />
      <motion.circle
        cx={cx} cy={cx} r={radius}
        fill="none"
        stroke={percent === 100 ? '#22c55e' : '#534AB7'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <text
        x={cx} y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size / 4.5}
        fontWeight="700"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cx}px` }}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
};
