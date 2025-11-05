import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '@/contexts/AudioContext';
import { useBTW } from '../hooks/useElectronDB';
import { useInvoices } from '../hooks/useElectronDB';
import { useExpenses } from '../hooks/useElectronDB';
import { useCompany } from '../hooks/useElectronDB';
import { useKOR, useBTWHealthScore, useBTWAnalytics, useBTWDeadlines } from '../hooks/useBTWAdvanced';
import { useMileage } from '../hooks/useMileage';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import {
  FileText,
  PlusCircle,
  Check,
  X,
  Download,
  Receipt,
  TrendUp,
  Calculator,
  Warning,
  ChartLine,
  ShieldCheck,
  CalendarBlank,
  Lightbulb,
  Car
} from '@phosphor-icons/react';
import type { BTWDeclaration, BTWPeriod, BTWCalculationData } from '../types/btw';

const QUARTERS: BTWPeriod[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const QUARTER_DATES = {
  Q1: { start: '-01-01', end: '-03-31' },
  Q2: { start: '-04-01', end: '-06-30' },
  Q3: { start: '-07-01', end: '-09-30' },
  Q4: { start: '-10-01', end: '-12-31' },
} as const;

export function BTWAangifte() {
  const { isMuted } = useAudio();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedPeriod, setSelectedPeriod] = useState<BTWPeriod>(`Q${currentQuarter}` as BTWPeriod);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // NOWY STATE: Zarządzanie kilometrami w BTW
  const [includeMileageInVAT, setIncludeMileageInVAT] = useState(false);

  const { declarations, loading: btwLoading, createBTW, updateBTW, deleteBTW, getBTWByPeriod, refetch } = useBTW();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { company } = useCompany();
  
  // NOWY HOOK: Kilometry
  const mileage = useMileage();

  // Advanced hooks
  const korData = useKOR(selectedYear);
  const healthScore = useBTWHealthScore();
  const analytics = useBTWAnalytics(
    `${selectedYear}-01-01`,
    `${selectedYear}-12-31`
  );
  const deadlines = useBTWDeadlines();

  // Form state
  const [formData, setFormData] = useState<Partial<BTWDeclaration>>({
    year: selectedYear,
    period: selectedPeriod,
    status: 'draft',
    revenue_nl_high: 0,
    revenue_nl_low: 0,
    revenue_nl_zero: 0,
    revenue_nl_other: 0,
    vat_high: 0,
    vat_low: 0,
    private_use_amount: 0,
    private_use_vat: 0,
    eu_services: 0,
    eu_acquisitions: 0,
    eu_acquisitions_vat: 0,
    input_vat_general: 0,
    total_vat_to_pay: 0,
    total_vat_deductible: 0,
    balance: 0,
    notes: '',
  });

  // Calculate BTW data from invoices and expenses for the selected period
  const calculatedData: BTWCalculationData = useMemo(() => {
    const dates = QUARTER_DATES[selectedPeriod];
    const startDate = `${selectedYear}${dates.start}`;
    const endDate = `${selectedYear}${dates.end}`;

    // Filter invoices for the selected period
    const periodInvoices = invoices.filter((inv: any) => {
      return inv.issue_date >= startDate && inv.issue_date <= endDate;
    });

    // Calculate revenue by VAT rate
    let vat21 = 0;
    let vat9 = 0;
    let vat0 = 0;
    let reverseCharge = 0;

    periodInvoices.forEach((inv: any) => {
      if (inv.vat_note?.includes('reverse charge') || inv.vat_note?.includes('odwrotne obciążenie')) {
        reverseCharge += inv.total_net;
      } else {
        // Determine VAT rate from invoice lines or total_vat/total_net ratio
        const vatRate = inv.total_net > 0 ? (inv.total_vat / inv.total_net) * 100 : 0;
        
        if (vatRate > 20) {
          vat21 += inv.total_net;
        } else if (vatRate > 8 && vatRate < 20) {
          vat9 += inv.total_net;
        } else if (vatRate < 1) {
          vat0 += inv.total_net;
        } else {
          // Default to 21% if unclear
          vat21 += inv.total_net;
        }
      }
    });

    // Filter expenses for the selected period
    const periodExpenses = expenses.filter((exp: any) => {
      return exp.date >= startDate && exp.date <= endDate;
    });

    // Calculate deductible VAT from expenses
    const deductibleVat = periodExpenses.reduce((sum: number, exp: any) => {
      if (exp.is_vat_deductible && exp.is_business_expense) {
        const deductibleAmount = exp.private_percentage 
          ? exp.vat_amount * (1 - exp.private_percentage / 100)
          : exp.vat_amount;
        return sum + deductibleAmount;
      }
      return sum;
    }, 0);

    const totalExpenses = periodExpenses.reduce((sum: number, exp: any) => sum + exp.amount_gross, 0);

    // NOWE: Obliczenia kilometrów dla okresu
    const mileageVATData = mileage.getVATData(selectedYear, selectedPeriod);
    const mileageDeductible = includeMileageInVAT ? mileageVATData.vat_deductible : 0;

    const vatToPay = vat21 * 0.21 + vat9 * 0.09;
    const balance = vatToPay - deductibleVat - mileageDeductible; // DODANO mileageDeductible

    return {
      period: {
        start: startDate,
        end: endDate,
        quarter: selectedPeriod,
        year: selectedYear,
      },
      invoices: {
        total: vat21 + vat9 + vat0 + reverseCharge,
        vat21,
        vat9,
        vat0,
        reverseCharge,
      },
      expenses: {
        total: totalExpenses,
        deductibleVat,
      },
      mileage: {
        total_km: mileageVATData.total_business_km,
        total_reimbursement: mileageVATData.total_reimbursement,
        vat_deductible: mileageVATData.vat_deductible,
        included: includeMileageInVAT,
      },
      balance,
    };
  }, [selectedYear, selectedPeriod, invoices, expenses, mileage, includeMileageInVAT]);

  // Auto-fill form with calculated data
  const handleAutoFill = () => {
    setFormData({
      ...formData,
      year: selectedYear,
      period: selectedPeriod,
      revenue_nl_high: Math.round(calculatedData.invoices.vat21 * 100) / 100,
      revenue_nl_low: Math.round(calculatedData.invoices.vat9 * 100) / 100,
      revenue_nl_zero: Math.round(calculatedData.invoices.vat0 * 100) / 100,
      revenue_nl_other: Math.round(calculatedData.invoices.reverseCharge * 100) / 100,
      vat_high: Math.round(calculatedData.invoices.vat21 * 0.21 * 100) / 100,
      vat_low: Math.round(calculatedData.invoices.vat9 * 0.09 * 100) / 100,
      input_vat_general: Math.round(calculatedData.expenses.deductibleVat * 100) / 100,
      total_vat_to_pay: Math.round((calculatedData.invoices.vat21 * 0.21 + calculatedData.invoices.vat9 * 0.09) * 100) / 100,
      total_vat_deductible: Math.round(calculatedData.expenses.deductibleVat * 100) / 100,
      balance: Math.round(calculatedData.balance * 100) / 100,
    });
  };

  // Recalculate totals when form data changes
  useEffect(() => {
    const totalVatToPay = 
      (formData.vat_high || 0) + 
      (formData.vat_low || 0) + 
      (formData.private_use_vat || 0) + 
      (formData.eu_acquisitions_vat || 0);
    
    const totalVatDeductible = formData.input_vat_general || 0;
    const balance = totalVatToPay - totalVatDeductible;

    setFormData(prev => ({
      ...prev,
      total_vat_to_pay: Math.round(totalVatToPay * 100) / 100,
      total_vat_deductible: Math.round(totalVatDeductible * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    }));
  }, [
    formData.vat_high,
    formData.vat_low,
    formData.private_use_vat,
    formData.eu_acquisitions_vat,
    formData.input_vat_general,
  ]);

  const handleSaveDeclaration = async () => {
    try {
      if (editingId) {
        await updateBTW(editingId, formData);
      } else {
        await createBTW(formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving BTW declaration:', error);
      alert(t('btw.errorSaving'));
    }
  };

  const handleEditDeclaration = async (id: string) => {
    const declaration = declarations.find((d: any) => d.id === id);
    if (declaration) {
      setFormData(declaration);
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDeleteDeclaration = async (id: string) => {
    if (window.confirm(t('btw.confirmDelete'))) {
      try {
        await deleteBTW(id);
        refetch();
      } catch (error) {
        console.error('Error deleting BTW declaration:', error);
        alert(t('btw.errorDeleting'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      year: selectedYear,
      period: selectedPeriod,
      status: 'draft',
      revenue_nl_high: 0,
      revenue_nl_low: 0,
      revenue_nl_zero: 0,
      revenue_nl_other: 0,
      vat_high: 0,
      vat_low: 0,
      private_use_amount: 0,
      private_use_vat: 0,
      eu_services: 0,
      eu_acquisitions: 0,
      eu_acquisitions_vat: 0,
      input_vat_general: 0,
      total_vat_to_pay: 0,
      total_vat_deductible: 0,
      balance: 0,
      notes: '',
    });
  };

  const handleNewDeclaration = () => {
    resetForm();
    setEditingId(null);
    setShowForm(true);
    handleAutoFill();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-blue-100 text-blue-800',
      submitted: 'bg-blue-200 text-blue-800',
      paid: 'bg-blue-200 text-blue-800',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  if (btwLoading || invoicesLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* UKŁAD: Film po lewej + Tekst z przyciskiem po prawej */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* LEWA STRONA: Film */}
        <div className="relative overflow-hidden rounded-3xl bg-black border-4 border-sky-300 shadow-lg shadow-sky-200/50 h-64 md:h-72 lg:h-80">
          <video 
            autoPlay 
            loop 
            muted={isMuted}
            playsInline
            className="absolute top-0 left-0 w-full h-full object-contain"
          >
            <source src="/btw angifte.mp4" type="video/mp4" />
          </video>
        </div>

        {/* PRAWA STRONA: Tekst i przyciski */}
        <div className="flex flex-col justify-center px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-black mb-3 md:mb-4 tracking-tight">
            📊 BTW Aangifte
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-black mb-6 md:mb-8 font-medium">
            Deklaracja VAT dla Holandii
          </p>
          <button onClick={handleNewDeclaration} className="px-10 py-5 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-lg shadow-2xl transition-all duration-500 hover:scale-105 flex items-center gap-3 w-fit">
            <PlusCircle size={24} weight="bold" />
            Nowa deklaracja
          </button>
        </div>
      </div>

      {/* Period Selector & Calculator */}
      {!showForm && (
        <Card className="mb-6 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Calculator size={32} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">{t('btw.calculator')}</h2>
              <p className="text-black text-sm">{t('btw.calculatorDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('btw.year')}
              </label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('btw.quarter')}
              </label>
              <Select
                value={selectedPeriod}
                onValueChange={(value) => setSelectedPeriod(value as BTWPeriod)}
              >
                {QUARTERS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAutoFill} className="w-full" variant="outline">
                <TrendUp size={20} className="mr-2" />
                {t('btw.calculate')}
              </Button>
            </div>
          </div>

          {/* Period Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">{t('btw.revenue21')}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(calculatedData.invoices.vat21)}
                  </p>
                  <p className="text-xs text-black mt-1">
                    BTW: {formatCurrency(calculatedData.invoices.vat21 * 0.21)}
                  </p>
                </div>
                <Receipt size={32} className="text-blue-600" />
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">{t('btw.revenue9')}</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(calculatedData.invoices.vat9)}
                  </p>
                  <p className="text-xs text-black mt-1">
                    BTW: {formatCurrency(calculatedData.invoices.vat9 * 0.09)}
                  </p>
                </div>
                <Receipt size={32} className="text-blue-600" />
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">{t('btw.deductibleVat')}</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(calculatedData.expenses.deductibleVat)}
                  </p>
                  <p className="text-xs text-black mt-1">
                    {t('btw.fromExpenses')}
                  </p>
                </div>
                <TrendUp size={32} className="text-blue-600" />
              </div>
            </Card>
          </div>

          {/* NOWA SEKCJA: Kilometry */}
          <Card className="mt-4 p-6 bg-indigo-50 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Car size={32} className="text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">Kilometry służbowe</h3>
                  <p className="text-sm text-black">Rozliczenie kilometrówki (€0.21/km)</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMileageInVAT}
                  onChange={(e) => setIncludeMileageInVAT(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-indigo-900">
                  {includeMileageInVAT ? '✅ Uwzględniono w VAT' : '☐ Pokaż oddzielnie'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs text-black mb-1">Kilometry</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {(calculatedData as any).mileage?.total_km?.toFixed(0) || '0'} km
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs text-black mb-1">Zwrot kilometrówki</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {formatCurrency((calculatedData as any).mileage?.total_reimbursement || 0)}
                </p>
                                <p className="text-xs text-black mt-1">@ €0.21/km</p>
              </div>

              <div className="p-4 bg-white/95 rounded-lg border border-blue-200">
                <p className="text-xs text-black mb-1">VAT do odliczenia</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency((calculatedData as any).mileage?.vat_deductible || 0)}
                </p>
                <p className="text-xs text-black mt-1">21% z zwrotu</p>
              </div>

              <div className="p-4 bg-white/95 rounded-lg border border-blue-200">
                <p className="text-xs text-black mb-1">Status</p>
                <p className="text-sm font-bold text-blue-700">
                  {includeMileageInVAT ? '✓ W deklaracji' : '○ Oddzielnie'}
                </p>
                <p className="text-xs text-black mt-1">
                  {includeMileageInVAT ? 'Sumowane z VAT' : 'Wyświetlane osobno'}
                </p>
              </div>
            </div>

            {!includeMileageInVAT && (calculatedData as any).mileage?.vat_deductible > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Wskazówka:</strong> Zaznacz opcję "Uwzględniono w VAT" aby dodać 
                  {formatCurrency((calculatedData as any).mileage?.vat_deductible || 0)} do odliczeń BTW. 
                  To zmniejszy Twoją płatność o tę kwotę.
                </p>
              </div>
            )}
          </Card>

          {/* Balance Summary */}
          <Card className={`mt-4 p-6 ${calculatedData.balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">{t('btw.balance')}</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(Math.abs(calculatedData.balance))}
                </p>
                <p className="text-sm text-black mt-1">
                  {calculatedData.balance > 0 ? t('btw.toPay') : t('btw.toReceive')}
                </p>
              </div>
              <div className="p-4 rounded-full bg-blue-100">
                {calculatedData.balance > 0 ? (
                  <Warning size={48} className="text-blue-600" />
                ) : (
                  <Check size={48} className="text-blue-600" />
                )}
              </div>
            </div>
          </Card>
        </Card>
      )}

      {/* Declaration Form */}
      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {editingId ? t('btw.editDeclaration') : t('btw.newDeclaration')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">{t('btw.revenueSection')}</h3>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.revenue21Field')}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.revenue_nl_high}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, revenue_nl_high: value, vat_high: value * 0.21 });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.revenue9Field')}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.revenue_nl_low}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, revenue_nl_low: value, vat_low: value * 0.09 });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.revenue0Field')}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.revenue_nl_zero}
                  onChange={(e) => setFormData({ ...formData, revenue_nl_zero: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.reverseChargeField')}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.revenue_nl_other}
                  onChange={(e) => setFormData({ ...formData, revenue_nl_other: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* VAT Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">{t('btw.vatSection')}</h3>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.deductibleVatField')}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.input_vat_general}
                  onChange={(e) => setFormData({ ...formData, input_vat_general: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <Card className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-black">{t('btw.totalVatToPay')}:</span>
                    <span className="font-semibold text-black">{formatCurrency(formData.total_vat_to_pay || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-black">{t('btw.totalVatDeductible')}:</span>
                    <span className="font-semibold text-black">{formatCurrency(formData.total_vat_deductible || 0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-black">{t('btw.balance')}:</span>
                    <span className="font-bold text-lg text-blue-700">
                      {formatCurrency(formData.balance || 0)}
                    </span>
                  </div>
                </div>
              </Card>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.status')}
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <option value="draft">{t('btw.statusDraft')}</option>
                  <option value="submitted">{t('btw.statusSubmitted')}</option>
                  <option value="paid">{t('btw.statusPaid')}</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('btw.notes')}
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder={t('btw.notesPlaceholder')}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSaveDeclaration} className="flex items-center gap-2">
              <Check size={20} />
              {t('btw.save')}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X size={20} />
              {t('btw.cancel')}
            </Button>
          </div>
        </Card>
      )}

      {/* Declarations History */}
      {!showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{t('btw.history')}</h2>
          </div>

          {declarations.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-black">{t('btw.noDeclarations')}</p>
              <Button onClick={handleNewDeclaration} className="mt-4">
                {t('btw.createFirst')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.period')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.revenue')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.vatToPay')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.vatDeductible')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.balance')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      {t('btw.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {declarations.map((decl: any) => (
                    <tr key={decl.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">
                          {decl.year} - {decl.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {formatCurrency((decl.revenue_nl_high || 0) + (decl.revenue_nl_low || 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {formatCurrency(decl.total_vat_to_pay || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {formatCurrency(decl.total_vat_deductible || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-700">
                          {formatCurrency(Math.abs(decl.balance || 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(decl.status)}`}>
                          {t(`btw.status${decl.status.charAt(0).toUpperCase() + decl.status.slice(1)}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDeclaration(decl.id)}
                          >
                            {t('btw.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDeclaration(decl.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {t('btw.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Advanced Analytics Section */}
      {showAdvanced && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* KOR Calculator */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-black">KOR (Kleine Ondernemersregeling)</h3>
            </div>
            {korData.calculation && (
              <div className="space-y-4">
                {/* Progress Bar - Próg KOR */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-black">Próg KOR: €20,000</span>
                    <span className="text-sm font-bold text-blue-700">
                      {((korData.korStatus?.annual_turnover! / 20000) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${
                        korData.korStatus?.annual_turnover! < 16000 ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((korData.korStatus?.annual_turnover! / 20000) * 100, 100)}%` }}
                    ></div>
                    {/* Marker 80% */}
                    <div className="absolute top-0 left-[80%] w-0.5 h-4 bg-blue-400"></div>
                  </div>
                  <div className="flex justify-between text-xs text-black mt-1">
                    <span>€0</span>
                    <span className="text-blue-600">€16,000 (80%)</span>
                    <span className="font-semibold">€20,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Obrót {selectedYear - 1}</p>
                    <p className="text-lg font-bold text-blue-700">
                      €{korData.calculation.previous_year_turnover.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Prognoza {selectedYear}</p>
                    <p className="text-lg font-bold text-blue-700">
                      €{korData.calculation.current_year_forecast.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Oszczędność KOR</p>
                    <p className="text-lg font-bold text-blue-700">
                      €{korData.calculation.savings_estimate.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Do progu</p>
                    <p className="text-lg font-bold text-orange-700">
                      €{Math.max(0, 20000 - korData.korStatus?.annual_turnover!).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  korData.korStatus?.isEligible 
                    ? korData.korStatus.annual_turnover < 16000
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-yellow-50 border-yellow-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {korData.korStatus?.isEligible ? (
                      korData.korStatus.annual_turnover < 19000 ? (
                        <Check className="h-6 w-6 text-green-600" />
                      ) : (
                        <Warning className="h-6 w-6 text-yellow-600" />
                      )
                    ) : (
                      <X className="h-6 w-6 text-red-600" />
                    )}
                    <span className="font-bold text-lg">
                      {korData.korStatus?.isEligible 
                        ? korData.korStatus.annual_turnover < 19000
                          ? '✅ Kwalifikujesz się do KOR'
                          : '⚠️ STREFA GRANICZNA KOR'
                        : '❌ Przekroczono próg KOR'}
                    </span>
                  </div>
                  
                  <div className="bg-white/60 rounded p-3 mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      {korData.korStatus?.notes}
                    </p>
                  </div>

                  <ul className="text-sm text-gray-800 space-y-2">
                    {korData.calculation?.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-tight">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="flex-1">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progi Deklaracji */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📅 Rodzaj rozliczeń BTW:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`p-2 rounded text-center ${
                      korData.korStatus?.annual_turnover! < 20000 
                        ? 'bg-green-100 border border-green-300 font-bold' 
                        : 'bg-gray-100 text-black'
                    }`}>
                      <div>Roczne</div>
                      <div className="text-xs">&lt; €20k (KOR)</div>
                    </div>
                    <div className={`p-2 rounded text-center ${
                      korData.korStatus?.annual_turnover! >= 20000 && korData.korStatus?.annual_turnover! <= 1500000
                        ? 'bg-blue-100 border border-blue-300 font-bold' 
                        : 'bg-gray-100 text-black'
                    }`}>
                      <div>Kwartalne</div>
                      <div className="text-xs">€20k - €1.5M</div>
                    </div>
                    <div className={`p-2 rounded text-center ${
                      korData.korStatus?.annual_turnover! > 1500000
                        ? 'bg-red-100 border border-red-300 font-bold' 
                        : 'bg-gray-100 text-black'
                    }`}>
                      <div>Miesięczne</div>
                      <div className="text-xs">&gt; €1.5M</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Health Score */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">BTW Health Score</h3>
            </div>
            {healthScore && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {healthScore.overall_score}
                  </div>
                  <p className="text-sm text-black">Ogólny wynik zgodności</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Zgodność</p>
                    <p className="text-xl font-semibold text-blue-700">{healthScore.components.compliance}%</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Dokładność</p>
                    <p className="text-xl font-semibold text-green-700">{healthScore.components.accuracy}%</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Terminowość</p>
                    <p className="text-xl font-semibold text-yellow-700">{healthScore.components.timeliness}%</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-black mb-1">Optymalizacja</p>
                    <p className="text-xl font-semibold text-purple-700">{healthScore.components.optimization}%</p>
                  </div>
                </div>
                {healthScore.issues && healthScore.issues.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-black mb-2">Problemy do rozwiązania:</p>
                    {healthScore.issues.slice(0, 3).map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 rounded mb-2">
                        <Warning className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-semibold text-gray-800">{issue.category}</p>
                          <p className="text-black">{issue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Analytics Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChartLine className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Analytics {selectedYear}</h3>
            </div>
            {analytics && (
              <div className="space-y-4">
                {analytics.kpis && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-black">Efektywna stawka VAT</p>
                      <p className="text-2xl font-bold text-black">
                        {(analytics.kpis.effective_vat_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-black">Wskaźnik odliczeń</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(analytics.kpis.deduction_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
                {analytics.top_expense_categories && analytics.top_expense_categories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-black mb-2">Top kategorie wydatków:</p>
                    {analytics.top_expense_categories.slice(0, 5).map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-black">{cat.category}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-black">€{cat.amount.toFixed(2)}</span>
                          <span className="text-xs text-black ml-2">({cat.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Deadlines */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarBlank className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold">Terminy płatności</h3>
            </div>
            {deadlines && deadlines.length > 0 && (
              <div className="space-y-3">
                {deadlines.filter(d => new Date(d.payment_due) >= new Date()).slice(0, 4).map((deadline, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border ${
                      deadline.days_remaining <= 7 
                        ? 'bg-red-50 border-red-200' 
                        : deadline.days_remaining <= 14
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-black">
                        {deadline.year} - {deadline.quarter}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        deadline.days_remaining <= 7
                          ? 'bg-red-100 text-red-700'
                          : deadline.days_remaining <= 14
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-black'
                      }`}>
                        {deadline.days_remaining} dni
                      </span>
                    </div>
                    <p className="text-xs text-black">
                      Termin: {new Date(deadline.payment_due).toLocaleDateString('pl-PL')}
                    </p>
                    {deadline.reminders && deadline.reminders.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Przypomnienie wysłane
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Toggle Advanced Analytics Button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-5 w-5" />
          {showAdvanced ? 'Ukryj zaawansowane analizy' : 'Pokaż zaawansowane analizy'}
        </Button>
      </div>
    </div>
  );
}

