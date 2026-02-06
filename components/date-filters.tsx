'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from 'lucide-react';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateFiltersProps {
  onDateRangeChange: (range: DateRange) => void;
}

export function DateFilters({ onDateRangeChange }: DateFiltersProps) {
  const today = new Date();
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: today,
  });
  const [selectedFilter, setSelectedFilter] = useState<string>('month');

  const getDateRange = (type: string): DateRange => {
    const now = new Date();
    const from = new Date();

    switch (type) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
      case 'week':
        const from1 = new Date(now);
        const day = now.getDay()
        const diff = now.getDay() - day +(day ===0? -6:1);
        from1.setDate(diff);
        from1.setHours(0,0,0,0)
        return { from:from1, to: now };
      case 'month':
        const from2 = new Date(now.getFullYear(),now.getMonth(),1,0,0,0,0)
        return { from:from2, to: now };
      case 'year':
        from.setMonth(0, 1);
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
      default:
        return customRange;
    }
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const newRange = { ...customRange };
    newRange[field] = new Date(value);
    setCustomRange(newRange);
    setSelectedFilter('custom');
    onDateRangeChange(newRange);
  };

  const handleQuickSelect = (type: string) => {
    const range = getDateRange(type);
    setSelectedFilter(type);
    onDateRangeChange(range);
  };

  const filterButtons = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterButtons.map((filter) => (
        <Button
          key={filter.id}
          size="sm"
          onClick={() => handleQuickSelect(filter.id)}
          className={selectedFilter === filter.id ? 'bg-primary text-primary-foreground' : ''}
          variant={selectedFilter === filter.id ? 'default' : 'outline'}
        >
          {filter.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            size="sm" 
            className={selectedFilter === 'custom' ? 'gap-2 bg-primary text-primary-foreground' : 'gap-2 bg-transparent'}
            variant={selectedFilter === 'custom' ? 'default' : 'outline'}
          >
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">From</label>
              <Input
                type="date"
                value={customRange.from.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <Input
                type="date"
                value={customRange.to.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
