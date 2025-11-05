import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TransportData {
  month: string;
  fuelCosts: number;
  mileageDeduction: number;
  totalTransport: number;
}

interface TransportCostsBarProps {
  data: TransportData[];
  currency?: string;
}

export function TransportCostsBar({ data, currency = '€' }: TransportCostsBarProps) {
  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TransportData;
      const netCost = data.fuelCosts - data.mileageDeduction;
      
      return (
        <div className="bg-white dark:bg-black/80 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-blue-500/30">
          <p className="font-semibold text-black dark:text-white mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-sm text-black dark:text-white">Koszty paliwa:</span>
              </div>
              <span className="font-semibold text-black dark:text-white">
                {formatCurrency(data.fuelCosts)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-black dark:text-white">Odliczenie km:</span>
              </div>
              <span className="font-semibold text-black dark:text-white">
                -{formatCurrency(data.mileageDeduction)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-blue-500/30">
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm font-semibold text-black dark:text-white">
                  Koszt netto:
                </span>
                <span className={`font-bold ${netCost > 0 ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
                  {formatCurrency(netCost)}
                </span>
              </div>
              {netCost < 0 && (
                <p className="text-xs text-black dark:text-white mt-1">
                  💰 Odliczenie przewyższa koszty!
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate statistics
  const totalFuel = data.reduce((sum, item) => sum + item.fuelCosts, 0);
  const totalMileage = data.reduce((sum, item) => sum + item.mileageDeduction, 0);
  const netTotal = totalFuel - totalMileage;
  const savingsPercentage = totalFuel > 0 ? (totalMileage / totalFuel) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⛽ Koszty Transportu
        </CardTitle>
        <CardDescription>
          Porównanie wydatków na paliwo z odliczeniami za kilometry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Paliwo ogółem
            </div>
            <div className="text-xl font-black text-black dark:text-white">
              {formatCurrency(totalFuel)}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              Odliczenie km
            </div>
            <div className="text-xl font-black text-black dark:text-white">
              {formatCurrency(totalMileage)}
            </div>
          </div>

          <div className={`${netTotal > 0 ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'} p-3 rounded-lg border`}>
            <div className={`text-xs font-semibold mb-1 ${netTotal > 0 ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
              Koszt netto
            </div>
            <div className={`text-xl font-black ${netTotal > 0 ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
              {formatCurrency(Math.abs(netTotal))}
            </div>
            {netTotal < 0 && (
              <div className="text-xs text-black dark:text-white mt-0.5">
                💰 Dodatnie
              </div>
            )}
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-black dark:text-white font-semibold mb-1">
              % Oszczędności
            </div>
            <div className="text-xl font-black text-black dark:text-white">
              {savingsPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            
            {/* Fuel costs bar */}
            <Bar 
              dataKey="fuelCosts" 
              name="Koszty paliwa"
              fill="rgb(244, 63, 94)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />

            {/* Mileage deduction bar */}
            <Bar 
              dataKey="mileageDeduction" 
              name="Odliczenie za km"
              fill="rgb(16, 185, 129)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />

            {/* Total transport bar */}
            <Bar 
              dataKey="totalTransport" 
              name="Transport ogółem"
              fill="rgb(59, 130, 246)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={400}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Analiza kosztów paliwa
              </p>
            </div>
            <p className="text-xs text-black dark:text-white leading-relaxed">
              Wydatki na paliwo w {data.length} miesiącach wyniosły {formatCurrency(totalFuel)}. 
              {totalFuel > 10000 ? ' To wysoka wartość - sprawdź optymalizację tras.' : ' Koszty są pod kontrolą.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Korzyść z odliczeń km
              </p>
            </div>
            <p className="text-xs text-black dark:text-white leading-relaxed">
              Odliczenia za kilometry dały {formatCurrency(totalMileage)} oszczędności, 
              co stanowi {savingsPercentage.toFixed(0)}% kosztów paliwa.
              {savingsPercentage > 80 && ' 🎉 Doskonała optymalizacja!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
