import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyTurnoverData {
  month: string;
  turnover: number;
  taxPercentage: number;
  taxAmount: number;
}

interface TurnoverTaxComboProps {
  data: MonthlyTurnoverData[];
  currency?: string;
}

export function TurnoverTaxCombo({ data, currency = '€' }: TurnoverTaxComboProps) {
  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-black/80 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-blue-500/30">
          <p className="font-semibold text-black dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-black dark:text-white">{entry.name}:</span>
              <span className="font-semibold text-black dark:text-white">
                {entry.dataKey === 'taxPercentage' 
                  ? formatPercent(entry.value as number)
                  : formatCurrency(entry.value as number)}
              </span>
            </div>
          ))}
          {/* Calculate effective rate */}
          {payload[0] && payload[2] && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-blue-500/30">
              <p className="text-xs text-black dark:text-white">
                Kwota VAT: {formatCurrency(payload[2].value as number)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate summary statistics
  const totalTurnover = data.reduce((sum, item) => sum + item.turnover, 0);
  const totalTax = data.reduce((sum, item) => sum + item.taxAmount, 0);
  const avgTaxRate = data.reduce((sum, item) => sum + item.taxPercentage, 0) / data.length;
  const maxTurnover = Math.max(...data.map(item => item.turnover));
  const maxTurnoverMonth = data.find(item => item.turnover === maxTurnover)?.month || '';

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Obrót + Stawka Podatkowa
        </CardTitle>
        <CardDescription>
          Połączony wykres: miesięczny obrót (słupki) i efektywna stawka VAT (linia)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
              Całkowity obrót
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(totalTurnover)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {data.length} miesięcy
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
              Całkowity VAT
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalTax)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Σ VAT należny
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-1">
              Średnia stawka
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {formatPercent(avgTaxRate)}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              VAT średnio
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-orange-700 dark:text-orange-300 font-semibold mb-1">
              Najlepszy miesiąc
            </div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
              {formatCurrency(maxTurnover)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {maxTurnoverMonth}
            </div>
          </div>
        </div>

        {/* Combined chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226, 232, 240)" />
            <XAxis 
              dataKey="month" 
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            {/* Left Y-axis for turnover */}
            <YAxis 
              yAxisId="left"
              stroke="rgb(59, 130, 246)"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tickFormatter={formatCurrency}
            />
            {/* Right Y-axis for tax percentage */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="rgb(168, 85, 247)"
              style={{ fontSize: '12px', fontWeight: 600 }}
              tickFormatter={formatPercent}
              domain={[0, 25]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            
            {/* Bars for turnover */}
            <Bar 
              yAxisId="left"
              dataKey="turnover" 
              name="Obrót miesięczny"
              fill="rgb(59, 130, 246)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            
            {/* Bar for tax amount (stacked effect) */}
            <Bar 
              yAxisId="left"
              dataKey="taxAmount" 
              name="Kwota VAT"
              fill="rgb(16, 185, 129)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />

            {/* Line for tax percentage */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="taxPercentage" 
              name="Stawka VAT (%)"
              stroke="rgb(168, 85, 247)"
              strokeWidth={3}
              dot={{ r: 5, fill: 'rgb(168, 85, 247)' }}
              activeDot={{ r: 7 }}
              animationDuration={1500}
              animationBegin={400}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Info note */}
        <div className="bg-slate-50 dark:bg-black/90/30 border border-slate-200 dark:border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-black dark:text-white font-semibold mb-2">
            📊 Jak czytać wykres:
          </p>
          <ul className="text-xs text-black dark:text-white space-y-1 list-disc list-inside">
            <li><strong className="text-blue-600 dark:text-blue-400">Niebieskie słupki</strong> - miesięczny obrót brutto (lewa oś)</li>
            <li><strong className="text-emerald-600 dark:text-emerald-400">Zielone słupki</strong> - kwota VAT należnego (lewa oś)</li>
            <li><strong className="text-purple-600 dark:text-purple-400">Fioletowa linia</strong> - efektywna stawka VAT w % (prawa oś)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
