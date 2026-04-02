import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Vaga, CandidateStatus } from '@/types';
import { ALL_STATUSES } from '@/types';

interface Filters {
  vagaId: string;
  statuses: CandidateStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  keyword: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  vagas: Vaga[];
  collapsed: boolean;
  onToggle: () => void;
}

const CandidateFilters: React.FC<Props> = ({ filters, onChange, vagas, collapsed, onToggle }) => {
  const toggleStatus = (status: CandidateStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: next });
  };

  const clearFilters = () => {
    onChange({ vagaId: 'all', statuses: [], keyword: '', dateFrom: undefined, dateTo: undefined });
  };

  const hasActiveFilters = filters.vagaId !== 'all' || filters.statuses.length > 0 || filters.keyword || filters.dateFrom || filters.dateTo;

  if (collapsed) {
    return (
      <Button variant="outline" size="icon" onClick={onToggle} className="shrink-0">
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-xl border bg-card p-4 space-y-5 h-fit sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </h3>
        <div className="flex gap-1">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
              Limpar
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Keyword */}
      <div className="space-y-1.5">
        <Label className="text-xs">Palavra-chave</Label>
        <Input
          value={filters.keyword}
          onChange={e => onChange({ ...filters, keyword: e.target.value })}
          placeholder="Buscar em respostas..."
          className="h-8 text-sm"
        />
      </div>

      {/* Vaga */}
      <div className="space-y-1.5">
        <Label className="text-xs">Vaga</Label>
        <Select value={filters.vagaId} onValueChange={v => onChange({ ...filters, vagaId: v })}>
          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as vagas</SelectItem>
            {vagas.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-xs">Status</Label>
        {ALL_STATUSES.map(s => (
          <div key={s} className="flex items-center gap-2">
            <Checkbox
              id={`status-${s}`}
              checked={filters.statuses.includes(s)}
              onCheckedChange={() => toggleStatus(s)}
            />
            <label htmlFor={`status-${s}`} className="text-sm cursor-pointer">{s}</label>
          </div>
        ))}
      </div>

      {/* Date Range */}
      <div className="space-y-1.5">
        <Label className="text-xs">Data de inscrição</Label>
        <div className="flex flex-col gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-start text-left text-xs h-8 w-full", !filters.dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="h-3 w-3 mr-1" />
                {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy') : 'De'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filters.dateFrom} onSelect={d => onChange({ ...filters, dateFrom: d })} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-start text-left text-xs h-8 w-full", !filters.dateTo && "text-muted-foreground")}>
                <CalendarIcon className="h-3 w-3 mr-1" />
                {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy') : 'Até'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filters.dateTo} onSelect={d => onChange({ ...filters, dateTo: d })} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default CandidateFilters;
export type { Filters };
