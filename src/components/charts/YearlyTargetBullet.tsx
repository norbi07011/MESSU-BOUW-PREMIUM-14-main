import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendUp, Warning } from '@phosphor-icons/react';

interface MonthlyTargetData {
  month: string;
  actual: number;
  target: number;
  forecast: number;
  variance: number;
}

interface YearlyTargetBulletProps {
  data: MonthlyTargetData[];
  yearlyGoal: number;
  currentTotal: number;
  currency?: string;
}

export function YearlyTargetBullet({ data, yearlyGoal, currentTotal, currency = '€' }: YearlyTargetBulletProps) {
  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyTargetData;
      const percentOfTarget = (data.actual / data.target) * 100;
      
      return (
        <div className="bg-white dark:bg-black/80 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-blue-500/30">
          <p className="font-semibold text-black dark:text-white mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-black dark:text-white">Rzeczywiste:</span>
              </div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.actual)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-black dark:text-white">Cel:</span>
              </div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.target)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-black dark:text-white">Prognoza:</span>
              </div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.forecast)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-blue-500/30">
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm font-semibold text-black dark:text-white">
                  % celu:
                </span>
                <span className={`font-bold ${percentOfTarget >= 100 ? 'text-blue-600 dark:text-blue-400' : percentOfTarget >= 80 ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {percentOfTarget.toFixed(1)}%
                </span>
              </div>
              {data.variance !== 0 && (
                <p className={`text-xs mt-1 ${data.variance > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {data.variance > 0 ? '📈' : '📉'} {data.variance > 0 ? '+' : ''}{formatCurrency(Math.abs(data.variance))}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate progress
  const progressPercentage = Math.min((currentTotal / yearlyGoal) * 100, 100);
  const remaining = Math.max(yearlyGoal - currentTotal, 0);
  const monthsPassed = data.filter(d => d.actual > 0).length;
  const monthsRemaining = 12 - monthsPassed;
  const averagePerMonth = currentTotal / monthsPassed;
  const projectedYearEnd = currentTotal + (averagePerMonth * monthsRemaining);
  const onTrack = projectedYearEnd >= yearlyGoal;

  // Performance zones
  const getZoneColor = () => {
    if (progressPercentage >= 90) return 'from-emerald-500 to-teal-500';
    if (progressPercentage >= 70) return 'from-blue-500 to-cyan-500';
    if (progressPercentage >= 50) return 'from-orange-500 to-amber-500';
    return 'from-rose-500 to-red-500';
  };

  const getZoneLabel = () => {
    if (progressPercentage >= 90) return 'DOSKONALE NA TORZE';
    if (progressPercentage >= 70) return 'DOBRY POSTĘP';
    if (progressPercentage >= 50) return 'WYMAGA UWAGI';
    return 'KRYTYCZNE OPÓŹNIENIE';
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Realizacja Celu Rocznego
        </CardTitle>
        <CardDescription>
          Porównanie rzeczywistych wyników z celem, prognozą i trajektorią sukcesu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress overview */}
        <div className={`bg-gradient-to-r ${getZoneColor()} text-white p-6 rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold mb-1 opacity-90">POSTĘP ROCZNY</p>
              <p className="text-5xl font-black">{progressPercentage.toFixed(1)}%</p>
              <p className="text-sm mt-1 opacity-90">{getZoneLabel()}</p>
            </div>
            <Target size={64} weight="duotone" className="opacity-80" />
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
              Cel roczny
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(yearlyGoal)}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
              Dotychczas
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(currentTotal)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {monthsPassed} miesięcy
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-1">
              Prognoza
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(projectedYearEnd)}
            </div>
            <div className={`text-xs mt-1 ${onTrack ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {onTrack ? '✓ Na torze' : '⚠ Poniżej celu'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${remaining > 0 ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'}`}>
            <div className={`text-xs font-semibold mb-1 ${remaining > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {remaining > 0 ? 'Pozostało' : 'Przekroczono'}
            </div>
            <div className={`text-2xl font-black ${remaining > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {formatCurrency(Math.abs(remaining))}
            </div>
          </div>
        </div>

        {/* Bullet chart */}
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226, 232, 240)" />
            <XAxis 
              dataKey="month" 
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            <YAxis 
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            
            {/* Target bars (background) */}
            <Bar 
              dataKey="target" 
              name="Cel miesięczny"
              fill="rgb(226, 232, 240)"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />

            {/* Actual bars */}
            <Bar 
              dataKey="actual" 
              name="Rzeczywiste"
              fill="rgb(59, 130, 246)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />

            {/* Forecast line */}
            <Line 
              type="monotone" 
              dataKey="forecast" 
              name="Prognoza"
              stroke="rgb(168, 85, 247)"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: 'rgb(168, 85, 247)' }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
              animationBegin={400}
            />

            {/* Reference line for average */}
            <ReferenceLine 
              y={averagePerMonth} 
              stroke="rgb(16, 185, 129)" 
              strokeDasharray="3 3"
              label={{ value: `Średnia: ${formatCurrency(averagePerMonth)}`, position: 'insideTopRight', fill: 'rgb(16, 185, 129)', fontSize: 11 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Analysis */}
        <div className={`${onTrack ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            {onTrack ? (
              <TrendUp size={24} weight="duotone" className="text-blue-600 dark:text-blue-400" />
            ) : (
              <Warning size={24} weight="duotone" className="text-blue-600 dark:text-blue-400" />
            )}
            <p className={`text-sm font-semibold ${onTrack ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
              {onTrack ? '🎉 Prognoza pozytywna' : '⚠️ Wymaga akcji'}
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${onTrack ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
            {onTrack ? (
              <>
                Przy obecnym tempie ({formatCurrency(averagePerMonth)}/miesiąc) osiągniesz cel roczny z nadwyżką {formatCurrency(projectedYearEnd - yearlyGoal)}. 
                Doskonała robota! 🚀
              </>
            ) : (
              <>
                Obecne tempo ({formatCurrency(averagePerMonth)}/miesiąc) jest niewystarczające. 
                Potrzebujesz średnio {formatCurrency(remaining / monthsRemaining)}/miesiąc przez pozostałe {monthsRemaining} miesięcy, 
                aby osiągnąć cel {formatCurrency(yearlyGoal)}.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
