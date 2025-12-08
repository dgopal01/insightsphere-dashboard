import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  delay?: number;
}

export function KpiCard({ title, value, icon: Icon, trend, onClick, delay = 0 }: KpiCardProps) {
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`bg-card rounded-lg border border-border p-6 ${
        isClickable ? "cursor-pointer hover:shadow-lg hover:border-secondary transition-all" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[rgb(40,51,74)] text-sm mb-2 text-[16px] font-bold">{title}</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-3xl text-primary"
          >
            {value}
          </motion.p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="bg-secondary/10 p-3 rounded-lg">
            <Icon className="text-secondary" size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
