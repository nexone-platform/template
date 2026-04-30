import React, { ReactNode } from 'react';
import { ChevronLeft, Save, X } from 'lucide-react';

interface FormTemplateProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  children: ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
}

export const FormTemplate = ({
  title,
  subtitle,
  onBack,
  onSave,
  onCancel,
  isSaving = false,
  children,
  saveLabel = 'บันทึก',
  cancelLabel = 'ยกเลิก',
}: FormTemplateProps) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onCancel && (
            <button 
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              {cancelLabel}
            </button>
          )}
          {onSave && (
            <button 
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'กำลังบันทึก...' : saveLabel}
            </button>
          )}
        </div>
      </div>
      
      {/* Content Form Scrollable Area */}
      <div className="p-6 overflow-auto max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
