import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DailySalesData {
  date: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  weekNumber: number;
  amount: number;
}

interface SalesHeatMapProps {
  data: DailySalesData[];
  currency?: string;
}

const DAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

export function SalesHeatMap({ data, currency = '€' }: SalesHeatMapProps) {
  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Group data by month and day of week
  const heatmapData = Array.from({ length: 12 }, (_, monthIdx) => {
    return Array.from({ length: 7 }, (_, dayIdx) => {
      const monthData = data.filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === monthIdx && d.dayOfWeek === dayIdx;
      });
      
      const total = monthData.reduce((sum, d) => sum + d.amount, 0);
      const count = monthData.length;
      const average = count > 0 ? total / count : 0;
      
      return {
        month: monthIdx,
        dayOfWeek: dayIdx,
        total,
        average,
        count
      };
    });
  });

  // Calculate min and max for color scaling
  const allAverages = heatmapData.flat().map(d => d.average).filter(v => v > 0);
  const minValue = Math.min(...allAverages);
  const maxValue = Math.max(...allAverages);

  // Get color based on value
  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-100 dark:bg-black/80';
    
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized >= 0.8) return 'bg-blue-500 dark:bg-blue-600';
    if (normalized >= 0.6) return 'bg-blue-500 dark:bg-blue-600';
    if (normalized >= 0.4) return 'bg-cyan-500 dark:bg-cyan-600';
    if (normalized >= 0.2) return 'bg-blue-400 dark:bg-blue-500';
    return 'bg-rose-400 dark:bg-rose-500';
  };

  // Statistics by day of week
  const dayStats = Array.from({ length: 7 }, (_, dayIdx) => {
    const dayData = data.filter(d => d.dayOfWeek === dayIdx);
    const total = dayData.reduce((sum, d) => sum + d.amount, 0);
    return {
      day: DAYS[dayIdx],
      total,
      average: total / Math.max(dayData.length, 1),
      count: dayData.length
    };
  });

  const bestDay = dayStats.reduce((max, stat) => stat.total > max.total ? stat : max, dayStats[0]);
  const worstDay = dayStats.reduce((min, stat) => stat.total < min.total && stat.total > 0 ? stat : min, dayStats[0]);

  // Statistics by month
  const monthStats = Array.from({ length: 12 }, (_, monthIdx) => {
    const monthData = data.filter(d => new Date(d.date).getMonth() === monthIdx);
    const total = monthData.reduce((sum, d) => sum + d.amount, 0);
    return {
      month: MONTHS[monthIdx],
      total,
      count: monthData.length
    };
  });

  const bestMonth = monthStats.reduce((max, stat) => stat.total > max.total ? stat : max, monthStats[0]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗓️ Mapa Cieplna Sprzedaży
        </CardTitle>
        <CardDescription>
          Wizualizacja aktywności sprzedażowej według dni tygodnia i miesięcy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Najlepszy dzień
            </div>
            <div className="text-2xl font-black text-black dark:text-white">
              {bestDay.day}
            </div>
            <div className="text-sm text-black dark:text-white mt-1">
              {formatCurrency(bestDay.total)} ({bestDay.count} transakcji)
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Najlepszy miesiąc
            </div>
            <div className="text-2xl font-black text-black dark:text-white">
              {bestMonth.month}
            </div>
            <div className="text-sm text-black dark:text-white mt-1">
              {formatCurrency(bestMonth.total)} ({bestMonth.count} transakcji)
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Najsłabszy dzień
            </div>
            <div className="text-2xl font-black text-black dark:text-white">
              {worstDay.day}
            </div>
            <div className="text-sm text-black dark:text-white mt-1">
              {formatCurrency(worstDay.total)} ({worstDay.count} transakcji)
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex items-start gap-2">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pt-10">
                {DAYS.map((day, idx) => (
                  <div 
                    key={idx}
                    className="h-12 flex items-center justify-end pr-2 text-xs font-semibold text-black dark:text-white"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex-1">
                {/* Month labels */}
                <div className="grid grid-cols-12 gap-1 mb-2">
                  {MONTHS.map((month, idx) => (
                    <div 
                      key={idx}
                      className="text-center text-xs font-semibold text-black dark:text-white"
                    >
                      {month}
                    </div>
                  ))}
                </div>

                {/* Grid cells */}
                <div className="grid grid-cols-12 gap-1">
                  {heatmapData.map((monthData, monthIdx) => (
                    <div key={monthIdx} className="flex flex-col gap-1">
                      {monthData.map((cell, dayIdx) => (
                        <div
                          key={`${monthIdx}-${dayIdx}`}
                          className={`h-12 rounded transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer ${getColor(cell.average)} ${cell.count === 0 ? 'opacity-30' : ''}`}
                          title={`${MONTHS[monthIdx]} - ${DAYS[dayIdx]}: ${formatCurrency(cell.average)} średnio (${cell.count} dni)`}
                        >
                          {cell.count > 0 && (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white drop-shadow">
                                {cell.count}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-black dark:text-white font-semibold">Niskie:</span>
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded bg-rose-400 dark:bg-rose-500"></div>
              <div className="w-6 h-6 rounded bg-blue-400 dark:bg-blue-500"></div>
              <div className="w-6 h-6 rounded bg-cyan-500 dark:bg-cyan-600"></div>
              <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-600"></div>
              <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-600"></div>
            </div>
            <span className="text-xs text-black dark:text-white font-semibold">Wysokie</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {formatCurrency(minValue)} - {formatCurrency(maxValue)}
          </Badge>
        </div>

        {/* Day of week analysis */}
        <div className="bg-slate-50 dark:bg-black/90/30 border border-slate-200 dark:border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-black dark:text-white font-semibold mb-3">
            📊 Analiza dni tygodnia
          </p>
          <div className="grid grid-cols-7 gap-2">
            {dayStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xs text-black dark:text-white font-semibold mb-1">
                  {stat.day}
                </div>
                <div className="text-sm font-bold text-black dark:text-white">
                  {formatCurrency(stat.average)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  średnio
                </div>
                <div className="mt-2 h-20 bg-slate-200 dark:bg-black/70 rounded relative overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full ${getColor(stat.average)} transition-all duration-500`}
                    style={{ height: `${(stat.total / bestDay.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-black dark:text-white font-semibold mb-2">
            💡 Wnioski z mapy cieplnej
          </p>
          <ul className="text-xs text-black dark:text-white space-y-1 list-disc list-inside leading-relaxed">
            <li>
              <strong>{bestDay.day}</strong> to najlepszy dzień tygodnia z {formatCurrency(bestDay.average)} średnio
            </li>
            <li>
              <strong>{bestMonth.month}</strong> był najlepszym miesiącem z {formatCurrency(bestMonth.total)} przychodu
            </li>
            <li>
              Liczba w komórce = ile razy ten dzień wystąpił w danym miesiącu
            </li>
            <li>
              Kolor = intensywność sprzedaży (ciemniejszy = wyższe przychody)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
