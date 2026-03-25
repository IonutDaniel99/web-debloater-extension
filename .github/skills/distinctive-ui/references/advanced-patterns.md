# Additional Patterns

More sophisticated component patterns for complex interactions.

## Complex Form with Multi-Step Flow

A form that feels premium with proper validation feedback and progress indication.

```tsx
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';

interface FormStep {
  id: string;
  title: string;
  description?: string;
}

const steps: FormStep[] = [
  { id: 'details', title: 'Basic Details' },
  { id: 'preferences', title: 'Preferences' },
  { id: 'review', title: 'Review' }
];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Steps */}
      <nav className="mb-8">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            const isUpcoming = index > currentStep;

            return (
              <li key={step.id} className="flex-1 group">
                <div className="flex items-center">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      "transition-all duration-200 font-medium text-sm",
                      isCompleted && [
                        "bg-primary text-primary-foreground",
                        "ring-4 ring-primary/20"
                      ],
                      isCurrent && [
                        "bg-primary text-primary-foreground",
                        "ring-4 ring-primary/20 scale-110"
                      ],
                      isUpcoming && [
                        "bg-secondary text-muted-foreground",
                        "border border-border"
                      ]
                    )}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className={cn(
                      "mt-2 text-xs font-medium text-center transition-colors",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-0.5 flex-1 mx-4 transition-all duration-300",
                      isCompleted ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Form content */}
      <div className={cn(
        "rounded-lg border bg-card p-8",
        "shadow-sm"
      )}>
        {/* Dynamic form content based on currentStep */}
        <div className="min-h-[300px]">
          {/* Your form fields here */}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Advanced Search/Filter Interface

A sophisticated filter panel with immediate visual feedback.

```tsx
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  name: string;
  options: FilterOption[];
}

const filterGroups: FilterGroup[] = [
  {
    name: 'Status',
    options: [
      { id: 'active', label: 'Active', count: 23 },
      { id: 'pending', label: 'Pending', count: 7 },
      { id: 'archived', label: 'Archived', count: 45 }
    ]
  },
  {
    name: 'Category',
    options: [
      { id: 'design', label: 'Design', count: 12 },
      { id: 'development', label: 'Development', count: 18 },
      { id: 'marketing', label: 'Marketing', count: 8 }
    ]
  }
];

export function AdvancedFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedFilters([]);
  };

  const hasActiveFilters = searchQuery || selectedFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Search bar with clear affordance */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className={cn(
            "w-full pl-10 pr-10 py-2.5 rounded-lg",
            "bg-background border border-input",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-shadow"
          )}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {selectedFilters.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {selectedFilters.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter groups */}
      {isExpanded && (
        <div className={cn(
          "space-y-6 p-4 rounded-lg border bg-card",
          "animate-in slide-in-from-top-2 duration-200"
        )}>
          {filterGroups.map((group) => (
            <div key={group.name} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {group.name}
              </h3>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const isSelected = selectedFilters.includes(option.id);
                  
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer group",
                        "transition-colors",
                        isSelected && "bg-accent",
                        !isSelected && "hover:bg-accent/50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleFilter(option.id)}
                        className="transition-transform group-hover:scale-110"
                      />
                      <span className="flex-1 text-sm text-foreground">
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {option.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Toast/Notification System

Contextual toasts with action buttons and auto-dismiss.

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ 
  toasts, 
  onDismiss 
}: { 
  toasts: Toast[]; 
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 w-full sm:w-96">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
}

function ToastItem({ 
  toast, 
  onDismiss,
  style 
}: { 
  toast: Toast; 
  onDismiss: () => void;
  style?: React.CSSProperties;
}) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: 'border-l-green-500 bg-green-50 dark:bg-green-500/10',
    error: 'border-l-red-500 bg-red-50 dark:bg-red-500/10',
    warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-500/10',
    info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-500/10'
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg border-l-4 shadow-lg",
        "bg-card border border-border",
        styles[toast.type],
        "animate-in slide-in-from-right-full duration-300"
      )}
      style={style}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColors[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-sm text-muted-foreground">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

## Usage Examples

```tsx
// Using the toast system
function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Changes saved',
      description: 'Your preferences have been updated successfully.',
      duration: 4000
    });
  };

  const handleError = () => {
    showToast({
      type: 'error',
      title: 'Failed to save',
      description: 'There was an error saving your changes.',
      action: {
        label: 'Retry',
        onClick: () => {
          // Retry logic
        }
      }
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Save</button>
    </div>
  );
}
```
