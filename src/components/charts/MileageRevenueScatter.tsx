import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps, ZAxis, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendUp, TrendDown } from '@phosphor-icons/react';

interface CorrelationData {
  month: string;
  kilometers: number;
  revenue: number;
  efficiency: number; // revenue per km
}

interface MileageRevenueScatterProps {
  data: CorrelationData[];
  currency?: string;
}

export function MileageRevenueScatter({ data, currency = '€' }: MileageRevenueScatterProps) {
  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatKm = (value: number) => {
    return `${value.toLocaleString('nl-NL')} km`;
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CorrelationData;
      
      return (
        <div className="bg-white dark:bg-black/80 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-blue-500/30">
          <p className="font-semibold text-black dark:text-white mb-3">{data.month}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-black dark:text-white">Kilometry:</span>
              <span className="font-semibold text-black dark:text-white">
                {formatKm(data.kilometers)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-black dark:text-white">Przychód:</span>
              <span className="font-semibold text-black dark:text-white">
                {formatCurrency(data.revenue)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-blue-500/30">
              <div className="flex items-center justify-between gap-6">
                <span className="text-sm font-semibold text-black dark:text-white">
                  Efektywność:
                </span>
                <span className="font-bold text-black dark:text-white">
                  {formatCurrency(data.efficiency)}/km
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate correlation coefficient (Pearson's r)
  const calculateCorrelation = () => {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.kilometers, 0);
    const sumY = data.reduce((sum, d) => sum + d.revenue, 0);
    const sumXY = data.reduce((sum, d) => sum + (d.kilometers * d.revenue), 0);
    const sumX2 = data.reduce((sum, d) => sum + (d.kilometers ** 2), 0);
    const sumY2 = data.reduce((sum, d) => sum + (d.revenue ** 2), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX ** 2)) * ((n * sumY2) - (sumY ** 2)));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();
  const correlationStrength = Math.abs(correlation);
  const isPositive = correlation > 0;

  const getCorrelationLabel = () => {
    if (correlationStrength > 0.8) return 'Bardzo silna';
    if (correlationStrength > 0.6) return 'Silna';
    if (correlationStrength > 0.4) return 'Umiarkowana';
    if (correlationStrength > 0.2) return 'Słaba';
    return 'Bardzo słaba';
  };

  // Statistics
  const avgEfficiency = data.reduce((sum, d) => sum + d.efficiency, 0) / data.length;
  const maxEfficiency = Math.max(...data.map(d => d.efficiency));
  const minEfficiency = Math.min(...data.map(d => d.efficiency));
  const bestMonth = data.find(d => d.efficiency === maxEfficiency)?.month || '';
  const worstMonth = data.find(d => d.efficiency === minEfficiency)?.month || '';

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Korelacja: Kilometry vs Przychód
        </CardTitle>
        <CardDescription>
          Analiza efektywności - czy więcej kilometrów przekłada się na wyższe przychody?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Correlation indicator */}
        <div className={`${isPositive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white p-6 rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold mb-1 opacity-90">WSPÓŁCZYNNIK KORELACJI</p>
              <p className="text-5xl font-black mb-2">{correlation.toFixed(3)}</p>
              <p className="text-sm opacity-90">
                {getCorrelationLabel()} korelacja {isPositive ? 'dodatnia' : 'ujemna'}
              </p>
            </div>
            {isPositive ? (
              <TrendUp size={64} weight="duotone" className="opacity-80" />
            ) : (
              <TrendDown size={64} weight="duotone" className="opacity-80" />
            )}
          </div>
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Średnia efektywność
            </div>
            <div className="text-2xl font-black text-black dark:text-white">
              {formatCurrency(avgEfficiency)}/km
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Najlepsza efektywność
            </div>
            <div className="text-2xl font-black text-black dark:text-white">
              {formatCurrency(maxEfficiency)}/km
            </div>
            <div className="text-xs text-black dark:text-white mt-1">
              {bestMonth}
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Najsłabsza efektywność
            </div>
            <div className="text-2xl font-black text-black dark:text-white">
              {formatCurrency(minEfficiency)}/km
            </div>
            <div className="text-xs text-black dark:text-white mt-1">
              {worstMonth}
            </div>
          </div>
        </div>

        {/* Scatter plot */}
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226, 232, 240)" />
            <XAxis 
              type="number"
              dataKey="kilometers" 
              name="Kilometry"
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tickFormatter={(value) => `${value} km`}
              label={{ value: 'Kilometry', position: 'insideBottom', offset: -10, style: { fontSize: '12px', fontWeight: 600 } }}
            />
            <YAxis 
              type="number"
              dataKey="revenue" 
              name="Przychód"
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tickFormatter={formatCurrency}
              label={{ value: 'Przychód (€)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fontWeight: 600 } }}
            />
            <ZAxis 
              type="number" 
              dataKey="efficiency" 
              range={[100, 1000]} 
              name="Efektywność"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />
            
            <Scatter 
              name="Miesiące" 
              data={data} 
              fill="rgb(168, 85, 247)"
              animationDuration={1500}
            />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Analysis */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
            💡 Interpretacja wykresu
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside leading-relaxed">
            <li>
              <strong>Współczynnik {correlation.toFixed(3)}</strong> oznacza {getCorrelationLabel().toLowerCase()} 
              {isPositive ? ' dodatnią' : ' ujemną'} zależność między km a przychodem
            </li>
            <li>
              {isPositive ? (
                <>Więcej kilometrów zazwyczaj = wyższe przychody (dobry znak dla mobilnej firmy budowlanej)</>
              ) : (
                <>Więcej kilometrów nie zawsze = wyższe przychody (warto zoptymalizować trasy)</>
              )}
            </li>
            <li>
              Każdy punkt to miesiąc - im większy, tym lepsza efektywność (€ przychodu na km)
            </li>
            <li>
              Najlepsza efektywność: {bestMonth} ({formatCurrency(maxEfficiency)}/km) 
              vs najsłabsza: {worstMonth} ({formatCurrency(minEfficiency)}/km)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
