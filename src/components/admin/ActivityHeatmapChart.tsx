import React, { useMemo, useState } from 'react';
import { SpotlightCard } from '../SpotlightCard';
import { Activity, Calendar, TrendingUp } from 'lucide-react';
import { RomItem } from '../../../shared/types';

interface ActivityHeatmapChartProps {
  roms: RomItem[];
  className?: string;
}

export const ActivityHeatmapChart: React.FC<ActivityHeatmapChartProps> = ({ roms, className = '' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate past 30 days data based on ROM creation/update timestamps
  const chartData = useMemo(() => {
    const daysMap = new Map<string, { date: string; label: string; count: number; updates: number }>();
    const now = new Date();

    // Initialize past 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap.set(dateKey, { date: dateKey, label, count: 0, updates: 0 });
    }

    // Tally ROM creations and updates
    roms.forEach(rom => {
      const rawDate = rom.updatedAt || rom.createdAt;
      if (rawDate) {
        const dateKey = rawDate.split('T')[0];
        if (daysMap.has(dateKey)) {
          const entry = daysMap.get(dateKey)!;
          entry.count += 1;
        }
      }
    });

    return Array.from(daysMap.values());
  }, [roms]);

  const totalUpdatesPastMonth = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const maxCount = useMemo(() => {
    const highest = Math.max(...chartData.map(d => d.count), 0);
    return highest > 4 ? highest : 4; // Keep minimum scale readable
  }, [chartData]);

  const yAxisTicks = useMemo(() => {
    return [maxCount, Math.round(maxCount / 2), 0];
  }, [maxCount]);

  return (
    <SpotlightCard className={`p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-[#38bdf8]" />
            <h3 className="text-lg font-bold text-[#121212] dark:text-[#F4EFE6] tracking-tight">
              Activity Frequency
            </h3>
          </div>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4]">
            ROM releases and updates recorded over the past 30 days
          </p>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-semibold text-[#121212] dark:text-[#F4EFE6] shadow-sm">
          <Calendar size={14} className="text-[#38bdf8]" />
          <span>{totalUpdatesPastMonth} Updates This Month</span>
        </div>
      </div>

      {/* SVG Interactive Bar Chart */}
      <div className="relative h-[220px] w-full pt-4 pb-2 select-none">
        {/* Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div 
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 z-20 transition-all duration-150"
            style={{
              left: `${((hoveredIndex + 0.5) / chartData.length) * 100}%`,
            }}
          >
            <div className="bg-[#12110D] text-[#F4EFE6] border border-[#36342A] px-3 py-2 rounded-xl shadow-xl text-xs whitespace-nowrap">
              <p className="font-bold text-[#FDE694]">{chartData[hoveredIndex].label}</p>
              <p className="text-[11px] text-[#A69F8B]">
                {chartData[hoveredIndex].count} ROM {chartData[hoveredIndex].count === 1 ? 'activity' : 'activities'}
              </p>
            </div>
          </div>
        )}

        <div className="flex h-[180px] w-full items-end gap-1 sm:gap-1.5 px-1 relative">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            {yAxisTicks.map((val, idx) => (
              <div key={idx} className="w-full flex items-center gap-2">
                <span className="text-[10px] text-[#787567] dark:text-[#A69F8B] w-4 text-right">
                  {val}
                </span>
                <div className="h-[1px] w-full bg-[#EBE4CF] dark:bg-[#36342A] border-dashed" />
              </div>
            ))}
          </div>

          {/* Bar Columns */}
          <div className="relative z-10 w-full h-full flex items-end justify-between pl-6">
            {chartData.map((item, idx) => {
              const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.date}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={`w-full max-w-[14px] sm:max-w-[20px] rounded-t-md transition-all duration-200 ${
                      item.count > 0
                        ? isHovered
                          ? 'bg-[#0284c7] dark:bg-[#38bdf8] scale-y-105 shadow-md shadow-[#38bdf8]/30'
                          : 'bg-[#0ea5e9] dark:bg-[#0284c7] opacity-85 hover:opacity-100'
                        : isHovered
                        ? 'bg-[#E5DFCA] dark:bg-[#2C2A22] h-[6px]'
                        : 'bg-[#ECE5D0] dark:bg-[#201F1A] h-[4px]'
                    }`}
                    style={{
                      height: item.count > 0 ? `${Math.max(heightPercent, 12)}%` : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Date Labels */}
        <div className="flex justify-between pl-7 pr-2 mt-2 text-[10px] text-[#787567] dark:text-[#A69F8B]">
          <span>{chartData[0]?.label}</span>
          <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
          <span>{chartData[chartData.length - 1]?.label}</span>
        </div>
      </div>
    </SpotlightCard>
  );
};
