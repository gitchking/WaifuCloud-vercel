import { Button } from "@/components/ui/button";
import { 
  Grid3X3, 
  Table, 
  Monitor, 
  Smartphone, 
  Calendar,
  TrendingUp
} from "lucide-react";

export interface FilterOptions {
  view: 'list' | 'table';
  device: 'desktop' | 'phone';
  sort: 'latest' | 'trending';
}

interface FilterSectionProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterSection = ({ filters, onFiltersChange }: FilterSectionProps) => {
  const updateFilter = <K extends keyof FilterOptions>(
    key: K, 
    value: FilterOptions[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const FilterButton = ({ 
    active, 
    onClick, 
    icon: Icon, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    icon: React.ComponentType<{ className?: string }>; 
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
        ${active 
          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
          : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40'
        }
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Button>
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 justify-end lg:justify-start">
        {/* View Type */}
        <FilterButton
          active={filters.view === 'list'}
          onClick={() => updateFilter('view', 'list')}
          icon={Grid3X3}
        >
          Grid
        </FilterButton>
        
        <FilterButton
          active={filters.view === 'table'}
          onClick={() => updateFilter('view', 'table')}
          icon={Table}
        >
          Table
        </FilterButton>

        {/* Device Type */}
        <FilterButton
          active={filters.device === 'desktop'}
          onClick={() => updateFilter('device', 'desktop')}
          icon={Monitor}
        >
          Desktop
        </FilterButton>
        
        <FilterButton
          active={filters.device === 'phone'}
          onClick={() => updateFilter('device', 'phone')}
          icon={Smartphone}
        >
          Phone
        </FilterButton>

        {/* Sort Options */}
        <FilterButton
          active={filters.sort === 'latest'}
          onClick={() => updateFilter('sort', 'latest')}
          icon={Calendar}
        >
          Latest
        </FilterButton>
        
        <FilterButton
          active={filters.sort === 'trending'}
          onClick={() => updateFilter('sort', 'trending')}
          icon={TrendingUp}
        >
          Trending
        </FilterButton>
      </div>
    </div>
  );
};