import React from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export const ScoreGauge = ({ score, size = 200, animated = true }) => {
  // Score should be 0-100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Determine color based on score ranges
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // green/success
    if (score >= 31) return '#f59e0b'; // orange/warning
    return '#ef4444'; // red/danger
  };

  const color = getScoreColor(normalizedScore);

  // Data for the gauge - reversed to show properly in semi-circle
  const data = [
    {
      name: 'score',
      value: normalizedScore,
      fill: color,
    },
  ];

  const containerSize = size + 40; // Add padding for labels

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: containerSize, height: containerSize / 2 + 40 }}>
        {/* Background arc */}
        <svg
          width={containerSize}
          height={containerSize / 2}
          className="absolute top-0 left-0"
        >
          <path
            d={`M ${containerSize * 0.1} ${containerSize / 2 - 20}
                A ${size / 2} ${size / 2} 0 0 1 ${containerSize * 0.9} ${containerSize / 2 - 20}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="20"
            strokeLinecap="round"
          />
        </svg>

        {/* Recharts gauge */}
        <RadialBarChart
          width={containerSize}
          height={containerSize / 2}
          cx={containerSize / 2}
          cy={containerSize / 2}
          innerRadius={size / 2 - 20}
          outerRadius={size / 2}
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={false}
            dataKey="value"
            cornerRadius={10}
            animationBegin={animated ? 300 : 0}
            animationDuration={animated ? 1500 : 0}
            animationEasing="ease-out"
          />
        </RadialBarChart>

        {/* Score text */}
        <div
          className="absolute"
          style={{
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-foreground">
              {Math.round(normalizedScore)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Score de conformité
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreGauge;
