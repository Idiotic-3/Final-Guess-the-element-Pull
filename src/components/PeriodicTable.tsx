import React, { useState } from "react";
import { ElementData } from "@/types/game";
import { elementData } from "@/data/elements";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodicTableProps {
  onElementClick?: (element: ElementData) => void;
  highlightedElement?: string;
}

const PeriodicTable = ({ onElementClick, highlightedElement }: PeriodicTableProps) => {
  const [viewMode, setViewMode] = useState<"standard" | "compact">("standard");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Get unique categories for filtering
  const categories = ["all", ...new Set(elementData.map(element => element.category))];

  // Filter elements based on selected category
  const filteredElements = filterCategory === "all" 
    ? elementData 
    : elementData.filter(element => element.category === filterCategory);

  const getElementColor = (category: string) => {
    const colors = {
      "nonmetal": "bg-emerald-100 hover:bg-emerald-200",
      "noble gas": "bg-purple-100 hover:bg-purple-200",
      "alkali metal": "bg-red-100 hover:bg-red-200",
      "alkaline earth metal": "bg-orange-100 hover:bg-orange-200",
      "metalloid": "bg-teal-100 hover:bg-teal-200",
      "halogen": "bg-yellow-100 hover:bg-yellow-200",
      "transition metal": "bg-blue-100 hover:bg-blue-200",
      "post-transition metal": "bg-indigo-100 hover:bg-indigo-200",
      "actinide": "bg-pink-100 hover:bg-pink-200",
      "lanthanide": "bg-rose-100 hover:bg-rose-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 hover:bg-gray-200";
  };

  const renderElement = (element: ElementData) => {
    const isHighlighted = highlightedElement === element.symbol;
    const baseClasses = "aspect-square p-1 flex flex-col items-center justify-center text-center transition-colors cursor-pointer";
    const colorClasses = getElementColor(element.category);
    const highlightClasses = isHighlighted ? "ring-2 ring-primary" : "";
    
    return (
      <button
        key={element.symbol}
        onClick={() => onElementClick?.(element)}
        className={cn(
          baseClasses,
          colorClasses,
          highlightClasses,
          "hover:scale-105 transition-transform"
        )}
        style={{ 
          gridColumn: element.xpos, 
          gridRow: element.ypos,
          width: "100%",
          height: "100%"
        }}
      >
        <div className="text-xs font-mono text-muted-foreground">{element.number}</div>
        <div className="text-base font-bold">{element.symbol}</div>
        {viewMode === "standard" && (
          <>
            <div className="text-xs truncate max-w-full">{element.name}</div>
            <div className="text-xs text-muted-foreground">
              {typeof element.atomic_mass === 'number' ? element.atomic_mass.toFixed(2) : '—'}
            </div>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 items-center justify-end">
        <Select
          value={filterCategory}
          onValueChange={setFilterCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={viewMode}
          onValueChange={setViewMode}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div 
        className="grid gap-1 relative" 
        style={{
          gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
          gridTemplateRows: "repeat(10, minmax(0, 1fr))",
          aspectRatio: "18/10"
        }}
      >
        {filteredElements.map(renderElement)}
      </div>
    </div>
  );
};

export default PeriodicTable;
