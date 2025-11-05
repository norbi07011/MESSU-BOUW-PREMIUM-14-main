import React from 'react';
import './WeekbriefTemplate.css';
import type { WeekbriefInstance } from '../../../types/weekbrief';
import { Phone, Globe } from 'lucide-react';

interface PezetWeekbriefTemplateProps {
  instance: WeekbriefInstance;
  mode: 'editable' | 'readonly' | 'print';
  onUpdate?: (instance: WeekbriefInstance) => void;
}

export const PezetWeekbriefTemplate: React.FC<PezetWeekbriefTemplateProps> = ({
  instance,
  mode,
  onUpdate
}) => {
  const isEditable = mode === 'editable';
  
  // Handler aktualizacji pola
  const handleFieldChange = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        ...instance,
        [field]: value
      });
    }
  };

  // Handler aktualizacji wpisu
  const handleEntryChange = (index: number, field: string, value: string) => {
    if (onUpdate) {
      const newEntries = [...instance.entries];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value
      };
      
      // Automatyczne przeliczenie totalu godzin dla wiersza
      if (['ma', 'di', 'wo', 'do', 'vr', 'za'].includes(field)) {
        const total = ['ma', 'di', 'wo', 'do', 'vr', 'za'].reduce((sum, day) => {
          const hours = parseFloat(newEntries[index][day] || '0');
          return sum + (isNaN(hours) ? 0 : hours);
        }, 0);
        newEntries[index].totaal = total.toFixed(1);
      }
      
      onUpdate({
        ...instance,
        entries: newEntries
      });
    }
  };

  // Obliczanie sum dla kolumn dni
  const calculateDayTotal = (day: string): string => {
    const total = instance.entries.reduce((sum, entry) => {
      const hours = parseFloat(entry[day] || '0');
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);
    return total.toFixed(1);
  };

  // Obliczanie całkowitej sumy godzin
  const calculateGrandTotal = (): string => {
    const total = instance.entries.reduce((sum, entry) => {
      const hours = parseFloat(entry.totaal || '0');
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);
    return total.toFixed(1);
  };

  return (
    <div className="weekbrief-template">
      {/* HEADER */}
      <div className="weekbrief-header">
        {/* Logo po lewej */}
        <div className="weekbrief-logo-section">
          <img 
            src="/pezet-logo-full.jpg" 
            alt="PEZET"
            className="weekbrief-logo"
          />
        </div>
        
        {/* Tytuł "Weekbrief" */}
        <div className="weekbrief-title-wrapper">
          <h2 className="weekbrief-template-title">Weekbrief</h2>
        </div>
        
        {/* Dane firmy po prawej */}
        <div className="weekbrief-company-info">
          <div className="weekbrief-company-name">
            PEZET
          </div>
          <div className="weekbrief-company-subtitle">
            VASTGOEDONDERHOUD
          </div>
          <div className="weekbrief-contact">
            <div className="weekbrief-contact-item">
              <Phone className="weekbrief-contact-icon" />
              <span>06 44 32 28 87</span>
            </div>
            <div className="weekbrief-contact-item">
              <Globe className="weekbrief-contact-icon" />
              <span>WWW.PEZETVASTGOEDONDERHOUD.NL</span>
            </div>
          </div>
        </div>
      </div>

      {/* POLA FORMULARZA */}
      <div className="weekbrief-form-fields">
        <div className="weekbrief-field">
          <span className="weekbrief-field-label">Naam:</span>
          {isEditable ? (
            <input
              type="text"
              className="weekbrief-field-input"
              value={instance.employeeName || ''}
              onChange={(e) => handleFieldChange('employeeName', e.target.value)}
              aria-label="Naam"
            />
          ) : (
            <span className="weekbrief-field-input">{instance.employeeName || ''}</span>
          )}
        </div>
        
        <div className="weekbrief-field">
          <span className="weekbrief-field-label">Weeknummer:</span>
          {isEditable ? (
            <input
              type="text"
              className="weekbrief-field-input"
              value={instance.weekNumber || ''}
              onChange={(e) => handleFieldChange('weekNumber', e.target.value)}
              aria-label="Weeknummer"
            />
          ) : (
            <span className="weekbrief-field-input">{instance.weekNumber || ''}</span>
          )}
        </div>
        
        <div className="weekbrief-field">
          <span className="weekbrief-field-label">Van:</span>
          {isEditable ? (
            <input
              type="text"
              className="weekbrief-field-input"
              value={instance.weekStartDate || ''}
              onChange={(e) => handleFieldChange('weekStartDate', e.target.value)}
              aria-label="Van"
            />
          ) : (
            <span className="weekbrief-field-input">{instance.weekStartDate || ''}</span>
          )}
        </div>
      </div>

      {/* TABELA GODZIN */}
      <table className="weekbrief-table">
        <thead>
          <tr>
            <th>Werknr</th>
            <th>Object</th>
            <th>Opdrachtgever</th>
            <th>Ma</th>
            <th>Di</th>
            <th>Wo</th>
            <th>Do</th>
            <th>Vr</th>
            <th>Za</th>
            <th>Totaal uren</th>
          </tr>
        </thead>
        <tbody>
          {/* 20 wierszy danych */}
          {[...Array(20)].map((_, index) => {
            const entry = instance.entries[index] || {
              werknr: '',
              object: '',
              opdrachtgever: '',
              ma: '',
              di: '',
              wo: '',
              do: '',
              vr: '',
              za: '',
              totaal: ''
            };
            
            return (
              <tr key={index}>
                <td>
                  {isEditable ? (
                    <input
                      type="text"
                      value={entry.werknr || ''}
                      onChange={(e) => handleEntryChange(index, 'werknr', e.target.value)}
                      aria-label={`Werknr rij ${index + 1}`}
                    />
                  ) : (
                    entry.werknr || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="text"
                      value={entry.object || ''}
                      onChange={(e) => handleEntryChange(index, 'object', e.target.value)}
                      aria-label={`Object rij ${index + 1}`}
                    />
                  ) : (
                    entry.object || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="text"
                      value={entry.opdrachtgever || ''}
                      onChange={(e) => handleEntryChange(index, 'opdrachtgever', e.target.value)}
                      aria-label={`Opdrachtgever rij ${index + 1}`}
                    />
                  ) : (
                    entry.opdrachtgever || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.5"
                      value={entry.ma || ''}
                      onChange={(e) => handleEntryChange(index, 'ma', e.target.value)}
                      aria-label={`Maandag rij ${index + 1}`}
                    />
                  ) : (
                    entry.ma || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.5"
                      value={entry.di || ''}
                      onChange={(e) => handleEntryChange(index, 'di', e.target.value)}
                      aria-label={`Dinsdag rij ${index + 1}`}
                    />
                  ) : (
                    entry.di || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.5"
                      value={entry.wo || ''}
                      onChange={(e) => handleEntryChange(index, 'wo', e.target.value)}
                      aria-label={`Woensdag rij ${index + 1}`}
                    />
                  ) : (
                    entry.wo || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.5"
                      value={entry.do || ''}
                      onChange={(e) => handleEntryChange(index, 'do', e.target.value)}
                      aria-label={`Donderdag rij ${index + 1}`}
                    />
                  ) : (
                    entry.do || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.5"
                      value={entry.vr || ''}
                      onChange={(e) => handleEntryChange(index, 'vr', e.target.value)}
                      aria-label={`Vrijdag rij ${index + 1}`}
                    />
                  ) : (
                    entry.vr || ''
                  )}
                </td>
                <td>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.5"
                      value={entry.za || ''}
                      onChange={(e) => handleEntryChange(index, 'za', e.target.value)}
                      aria-label={`Zaterdag rij ${index + 1}`}
                    />
                  ) : (
                    entry.za || ''
                  )}
                </td>
                <td>{entry.totaal || ''}</td>
              </tr>
            );
          })}
          
          {/* Wiersz Tot. uren */}
          <tr className="total-row">
            <td></td>
            <td>Tot. uren</td>
            <td></td>
            <td>{calculateDayTotal('ma')}</td>
            <td>{calculateDayTotal('di')}</td>
            <td>{calculateDayTotal('wo')}</td>
            <td>{calculateDayTotal('do')}</td>
            <td>{calculateDayTotal('vr')}</td>
            <td>{calculateDayTotal('za')}</td>
            <td>{calculateGrandTotal()}</td>
          </tr>
          
          {/* Wiersz Paraf Uitvoerder */}
          <tr className="signature-row">
            <td></td>
            <td>Paraf Uitvoerder</td>
            <td colSpan={8}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PezetWeekbriefTemplate;
