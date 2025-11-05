/**
 * TEMPLATE LIBRARY MODAL
 * Biblioteka gotowych szablonów - wybierz i załaduj
 */

import { WeekbriefTemplate } from '@/types/weekbrief';
import { TEMPLATE_CATEGORIES, ALL_PRESET_TEMPLATES } from './templatePresets';
import { FileText, X, Building, Code, Truck } from '@phosphor-icons/react';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WeekbriefTemplate) => void;
}

const CATEGORY_ICONS = {
  construction: Building,
  it: Code,
  transport: Truck
};

export function TemplateLibraryModal({ isOpen, onClose, onSelectTemplate }: TemplateLibraryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-sky-500 to-blue-600">
          <div className="flex items-center gap-3">
            <FileText size={28} weight="duotone" className="text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Biblioteka Szablonów</h2>
              <p className="text-sm text-sky-50">Wybierz gotowy szablon dla swojej branży</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Zamknij bibliotekę szablonów"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} weight="bold" className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Categories */}
          {Object.entries(TEMPLATE_CATEGORIES).map(([categoryKey, category]) => {
            const Icon = CATEGORY_ICONS[categoryKey as keyof typeof CATEGORY_ICONS];
            
            return (
              <div key={categoryKey} className="mb-8 last:mb-0">
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={24} weight="duotone" className="text-sky-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {category.icon} {category.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({category.templates.length} {category.templates.length === 1 ? 'szablon' : 'szablony'})
                  </span>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="bg-white border-2 border-sky-300 rounded-lg p-4 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-200/50 transition-all text-left group"
                    >
                      {/* Template Name */}
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                        {template.name}
                      </h4>

                      {/* Template Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Template Stats */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded">
                          {template.config.columns.length} kolumn
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {template.config.rows} wierszy
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {template.config.pageSize}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {template.config.orientation === 'portrait' ? '📄 Pionowo' : '📃 Poziomo'}
                        </span>
                      </div>

                      {/* Column Preview */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Kolumny:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.config.columns.slice(0, 4).map((col, idx) => (
                            <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-200">
                              {col.label}
                            </span>
                          ))}
                          {template.config.columns.length > 4 && (
                            <span className="text-xs px-1.5 py-0.5 text-gray-500">
                              +{template.config.columns.length - 4} więcej
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 <strong>Wskazówka:</strong> Możesz edytować każdy szablon po załadowaniu
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
