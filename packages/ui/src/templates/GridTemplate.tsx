import React, { ReactNode } from 'react';
import { Plus, Search, Filter } from 'lucide-react';

interface GridTemplateProps {
  title: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  children: ReactNode;
}

export const GridTemplate = ({
  title,
  description,
  primaryActionLabel = 'เพิ่มข้อมูล',
  onPrimaryAction,
  searchPlaceholder = 'ค้นหา...',
  onSearch,
  children,
}: GridTemplateProps) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        
        {/* Actions Menu */}
        <div className="mt-4 sm:mt-0 flex gap-3">
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          
          <button className="flex items-center justify-center p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
          
          {onPrimaryAction && (
            <button 
              onClick={onPrimaryAction}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              {primaryActionLabel}
            </button>
          )}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
