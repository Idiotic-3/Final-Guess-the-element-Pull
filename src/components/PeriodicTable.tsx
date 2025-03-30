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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    }
  }
}

interface PeriodicTableProps {
  onElementClick: (element: ElementData) => void;
  selectedElement: ElementData | null;
  correctElement?: string;
}

const PeriodicTable = ({ onElementClick, selectedElement, correctElement }: PeriodicTableProps) => {
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
      "noble-gas": "bg-purple-100 hover:bg-purple-200",
      "alkali-metal": "bg-red-100 hover:bg-red-200",
      "alkaline-earth": "bg-orange-100 hover:bg-orange-200",
      "metalloid": "bg-teal-100 hover:bg-teal-200",
      "halogen": "bg-yellow-100 hover:bg-yellow-200",
      "transition": "bg-blue-100 hover:bg-blue-200",
      "post-transition": "bg-indigo-100 hover:bg-indigo-200",
      "actinide": "bg-pink-100 hover:bg-pink-200",
      "lanthanide": "bg-rose-100 hover:bg-rose-200",
      "default": "bg-gray-100 hover:bg-gray-200"
    };
    
    return colors[category as keyof typeof colors] || colors.default;
  };

  // Generate the periodic table grid layout
  const renderPeriodicTable = () => {
    const maxPeriod = 7;
    const maxGroup = 18;
    
    const grid = Array(maxPeriod).fill(null).map(() => Array(maxGroup).fill(null));
    
    // Place elements in their correct positions
    filteredElements.forEach(element => {
      if (element.period <= maxPeriod && element.group <= maxGroup) {
        grid[element.period - 1][element.group - 1] = element;
      }
    });
    
    // Special handling for lanthanides and actinides in standard view
    if (viewMode === "standard") {
      // Move lanthanides and actinides to special rows
      filteredElements.forEach(element => {
        if (element.category === "lanthanide" || element.category === "actinide") {
          grid[element.period - 1][element.group - 1] = null;
        }
      });
    }
    
    return (
      <div className="relative">
        {viewMode === "standard" && (
          <div className="grid-layout">
            {/* Group numbers */}
            <div className="flex mb-1">
              {Array.from({ length: maxGroup }, (_, i) => (
                <div key={`group-${i+1}`} className="w-14 text-center text-xs font-semibold text-gray-500">
                  {i+1}
                </div>
              ))}
            </div>
            
            {/* Main periodic table grid with period numbers */}
            {grid.map((row, periodIndex) => (
              <div key={`period-${periodIndex+1}`} className="flex items-center mb-1">
                <div className="w-4 mr-1 text-xs font-semibold text-gray-500">
                  {periodIndex+1}
                </div>
                <div className="flex">
                  {row.map((element, groupIndex) => {
                    if (!element) return (
                      <div key={`empty-${periodIndex}-${groupIndex}`} className="w-14 h-14" />
                    );
                    
                    const isSelected = selectedElement?.symbol === element.symbol;
                    const isCorrect = correctElement === element.symbol;
                    
                    // Handle La and Ac placeholders at group 3 for periods 6 and 7
                    const isLanthanidePlaceholder = periodIndex === 5 && groupIndex === 2;
                    const isActinidePlaceholder = periodIndex === 6 && groupIndex === 2;
                    
                    if ((isLanthanidePlaceholder || isActinidePlaceholder) && 
                        filterCategory !== "lanthanide" && filterCategory !== "actinide") {
                      return (
                        <button
                          key={`element-${element.symbol}`}
                          onClick={() => onElementClick(element)}
                          className={cn(
                            "w-14 h-14 rounded-md flex flex-col items-center justify-center transition-all",
                            getElementColor(element.category),
                            isSelected && "ring-2 ring-blue-500 scale-105",
                            isSelected && isCorrect && "bg-green-200 hover:bg-green-300"
                          )}
                        >
                          <div className="atomic-number text-[9px] text-gray-500 absolute top-1 left-1.5">{element.atomicNumber}</div>
                          <div className="symbol text-lg font-bold">{element.symbol}</div>
                          <div className="name text-[10px] font-medium truncate max-w-full px-1">{element.name}</div>
                        </button>
                      );
                    }
                    
                    return (
                      <button
                        key={`element-${element.symbol}`}
                        onClick={() => onElementClick(element)}
                        className={cn(
                          "w-14 h-14 rounded-md flex flex-col items-center justify-center transition-all",
                          getElementColor(element.category),
                          isSelected && "ring-2 ring-blue-500 scale-105",
                          isSelected && isCorrect && "bg-green-200 hover:bg-green-300"
                        )}
                      >
                        <div className="atomic-number text-[9px] text-gray-500 absolute top-1 left-1.5">{element.atomicNumber}</div>
                        <div className="symbol text-lg font-bold">{element.symbol}</div>
                        <div className="name text-[10px] font-medium truncate max-w-full px-1">{element.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Special rows for lanthanides and actinides */}
            {filterCategory === "all" || filterCategory === "lanthanide" ? (
              <div className="flex items-center mt-4 mb-1">
                <div className="w-4 mr-1"></div>
                <div className="flex ml-[8.5rem]">
                  {filteredElements
                    .filter(e => e.category === "lanthanide")
                    .sort((a, b) => a.atomicNumber - b.atomicNumber)
                    .map(element => {
                      const isSelected = selectedElement?.symbol === element.symbol;
                      const isCorrect = correctElement === element.symbol;
                      
                      return (
                        <button
                          key={`lanthanide-${element.symbol}`}
                          onClick={() => onElementClick(element)}
                          className={cn(
                            "w-14 h-14 rounded-md flex flex-col items-center justify-center transition-all",
                            getElementColor(element.category),
                            isSelected && "ring-2 ring-blue-500 scale-105",
                            isSelected && isCorrect && "bg-green-200 hover:bg-green-300"
                          )}
                        >
                          <div className="atomic-number text-[9px] text-gray-500 absolute top-1 left-1.5">{element.atomicNumber}</div>
                          <div className="symbol text-lg font-bold">{element.symbol}</div>
                          <div className="name text-[10px] font-medium truncate max-w-full px-1">{element.name}</div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : null}
            
            {filterCategory === "all" || filterCategory === "actinide" ? (
              <div className="flex items-center mb-1">
                <div className="w-4 mr-1"></div>
                <div className="flex ml-[8.5rem]">
                  {filteredElements
                    .filter(e => e.category === "actinide")
                    .sort((a, b) => a.atomicNumber - b.atomicNumber)
                    .map(element => {
                      const isSelected = selectedElement?.symbol === element.symbol;
                      const isCorrect = correctElement === element.symbol;
                      
                      return (
                        <button
                          key={`actinide-${element.symbol}`}
                          onClick={() => onElementClick(element)}
                          className={cn(
                            "w-14 h-14 rounded-md flex flex-col items-center justify-center transition-all",
                            getElementColor(element.category),
                            isSelected && "ring-2 ring-blue-500 scale-105",
                            isSelected && isCorrect && "bg-green-200 hover:bg-green-300"
                          )}
                        >
                          <div className="atomic-number text-[9px] text-gray-500 absolute top-1 left-1.5">{element.atomicNumber}</div>
                          <div className="symbol text-lg font-bold">{element.symbol}</div>
                          <div className="name text-[10px] font-medium truncate max-w-full px-1">{element.name}</div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : null}
          </div>
        )}
        
        {/* Compact view just shows a simple grid of filtered elements */}
        {viewMode === "compact" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
            {filteredElements.map(element => {
              const isSelected = selectedElement?.symbol === element.symbol;
              const isCorrect = correctElement === element.symbol;
              
              return (
                <button
                  key={`compact-${element.symbol}`}
                  onClick={() => onElementClick(element)}
                  className={cn(
                    "element w-full h-14 rounded-md flex flex-col items-center justify-center transition-all",
                    getElementColor(element.category),
                    isSelected && "ring-2 ring-blue-500 scale-105",
                    isSelected && isCorrect && "bg-green-200 hover:bg-green-300"
                  )}
                >
                  <div className="atomic-number text-[9px] text-gray-500 absolute top-1 left-1.5">{element.atomicNumber}</div>
                  <div className="symbol text-lg font-bold">{element.symbol}</div>
                  <div className="name text-[10px] font-medium truncate max-w-full px-1">{element.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="periodic-table w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Click on an element to make your guess!
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "standard" | "compact")}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {renderPeriodicTable()}
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-nonmetal bg-emerald-100 mr-2"></div>
          <span className="text-xs">Nonmetal</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-noble-gas bg-purple-100 mr-2"></div>
          <span className="text-xs">Noble Gas</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-alkali-metal bg-red-100 mr-2"></div>
          <span className="text-xs">Alkali Metal</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-alkaline-earth bg-orange-100 mr-2"></div>
          <span className="text-xs">Alkaline Earth</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-transition bg-blue-100 mr-2"></div>
          <span className="text-xs">Transition Metal</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-post-transition bg-indigo-100 mr-2"></div>
          <span className="text-xs">Post-Transition</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-metalloid bg-teal-100 mr-2"></div>
          <span className="text-xs">Metalloid</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-lanthanide bg-rose-100 mr-2"></div>
          <span className="text-xs">Lanthanide</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-actinide bg-pink-100 mr-2"></div>
          <span className="text-xs">Actinide</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-halogen bg-yellow-100 mr-2"></div>
          <span className="text-xs">Halogen</span>
        </div>
      </div>
    </div>
  );
};

export default PeriodicTable;
