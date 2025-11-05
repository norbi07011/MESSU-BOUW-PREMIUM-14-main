/**
 * MILEAGE HOOK - Zarządzanie kilometrami służbowymi
 * Integracja z Electron Database
 */

import { useState, useEffect, useCallback } from 'react';
import type { MileageEntry, MileageSummary, MileageVATData } from '@/types/mileage';
import { MILEAGE_RATES_NL } from '@/types/mileage';

const TABLE_NAME = 'mileage';

export function useMileage() {
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in Electron environment
  const isElectron = typeof window !== 'undefined' && (window as any).electron;

  // Fetch all mileage entries
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      if (isElectron) {
        const result = await (window as any).electron.database.getAll(TABLE_NAME);
        setEntries(result || []);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('mileage_entries');
        setEntries(stored ? JSON.parse(stored) : []);
      }
    } catch (err) {
      setError('Error loading mileage entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isElectron]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Create new mileage entry
  const createEntry = useCallback(async (data: Partial<MileageEntry>) => {
    try {
      const newEntry: MileageEntry = {
        ...data as MileageEntry,
        id: data.id || `mileage-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isElectron) {
        await (window as any).electron.database.create(TABLE_NAME, newEntry);
      } else {
        const current = [...entries, newEntry];
        setEntries(current);
        localStorage.setItem('mileage_entries', JSON.stringify(current));
      }

      await fetchEntries();
      return newEntry;
    } catch (err) {
      setError('Error creating mileage entry');
      console.error(err);
      throw err;
    }
  }, [isElectron, entries, fetchEntries]);

  // Update mileage entry
  const updateEntry = useCallback(async (id: string, data: Partial<MileageEntry>) => {
    try {
      const updated = {
        ...data,
        id,
        updated_at: new Date().toISOString(),
      };

      if (isElectron) {
        await (window as any).electron.database.update(TABLE_NAME, id, updated);
      } else {
        const current = entries.map(e => e.id === id ? { ...e, ...updated } : e);
        setEntries(current);
        localStorage.setItem('mileage_entries', JSON.stringify(current));
      }

      await fetchEntries();
    } catch (err) {
      setError('Error updating mileage entry');
      console.error(err);
      throw err;
    }
  }, [isElectron, entries, fetchEntries]);

  // Delete mileage entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      if (isElectron) {
        await (window as any).electron.database.delete(TABLE_NAME, id);
      } else {
        const current = entries.filter(e => e.id !== id);
        setEntries(current);
        localStorage.setItem('mileage_entries', JSON.stringify(current));
      }

      await fetchEntries();
    } catch (err) {
      setError('Error deleting mileage entry');
      console.error(err);
      throw err;
    }
  }, [isElectron, entries, fetchEntries]);

  // Get entries by date range
  const getEntriesByDateRange = useCallback((startDate: string, endDate: string): MileageEntry[] => {
    return entries.filter(e => e.date >= startDate && e.date <= endDate);
  }, [entries]);

  // Calculate summary for period
  const getSummary = useCallback((startDate: string, endDate: string): MileageSummary => {
    const periodEntries = getEntriesByDateRange(startDate, endDate);
    
    const totalDistance = periodEntries.reduce((sum, e) => sum + e.distance_km, 0);
    const businessDistance = periodEntries.filter(e => e.is_business).reduce((sum, e) => sum + e.distance_km, 0);
    const privateDistance = totalDistance - businessDistance;
    const totalReimbursement = periodEntries.reduce((sum, e) => sum + e.total_reimbursement, 0);
    const businessReimbursement = periodEntries.filter(e => e.is_business).reduce((sum, e) => sum + e.total_reimbursement, 0);
    const vatComponent = businessReimbursement * 0.21; // 21% VAT z business reimbursement

    // Group by purpose
    const byPurpose: any = {};
    periodEntries.forEach(e => {
      if (!byPurpose[e.purpose]) {
        byPurpose[e.purpose] = { count: 0, distance_km: 0, reimbursement: 0 };
      }
      byPurpose[e.purpose].count++;
      byPurpose[e.purpose].distance_km += e.distance_km;
      byPurpose[e.purpose].reimbursement += e.total_reimbursement;
    });

    // Group by vehicle
    const byVehicle: any = {};
    periodEntries.forEach(e => {
      if (!byVehicle[e.vehicle_type]) {
        byVehicle[e.vehicle_type] = { count: 0, distance_km: 0, reimbursement: 0 };
      }
      byVehicle[e.vehicle_type].count++;
      byVehicle[e.vehicle_type].distance_km += e.distance_km;
      byVehicle[e.vehicle_type].reimbursement += e.total_reimbursement;
    });

    return {
      period: {
        start: startDate,
        end: endDate,
        type: 'monthly', // Can be determined dynamically
      },
      total_entries: periodEntries.length,
      total_distance_km: totalDistance,
      business_distance_km: businessDistance,
      private_distance_km: privateDistance,
      total_reimbursement: totalReimbursement,
      business_reimbursement: businessReimbursement,
      vat_component: vatComponent,
      by_purpose: byPurpose,
      by_vehicle: byVehicle,
    };
  }, [getEntriesByDateRange]);

  // Get VAT data for BTW Aangifte
  const getVATData = useCallback((year: number, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'): MileageVATData => {
    const quarterDates = {
      Q1: { start: `${year}-01-01`, end: `${year}-03-31` },
      Q2: { start: `${year}-04-01`, end: `${year}-06-30` },
      Q3: { start: `${year}-07-01`, end: `${year}-09-30` },
      Q4: { start: `${year}-10-01`, end: `${year}-12-31` },
    };

    const dates = quarterDates[quarter];
    const summary = getSummary(dates.start, dates.end);

    return {
      year,
      quarter,
      total_business_km: summary.business_distance_km,
      total_reimbursement: summary.business_reimbursement,
      vat_deductible: summary.vat_component,
      vat_deductible_percentage: 21,
      included_in_btw: false, // Default, can be updated
      notes: `${summary.total_entries} wpisów, ${summary.business_distance_km.toFixed(0)} km służbowych`,
    };
  }, [getSummary]);

  // Calculate reimbursement
  const calculateReimbursement = useCallback((distance_km: number, vehicle_type: keyof typeof MILEAGE_RATES_NL = 'car'): number => {
    const rate = MILEAGE_RATES_NL[vehicle_type];
    return Math.round(distance_km * rate * 100) / 100;
  }, []);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
    getEntriesByDateRange,
    getSummary,
    getVATData,
    calculateReimbursement,
  };
}
