import { ElementData } from "@/types/game";
import { elementData } from "@/data/elements";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PeriodicTableProps {
  onElementClick: (element: ElementData) => void;
  selectedElement?: ElementData | null;
  correctElement?: string | null;
}

export function PeriodicTable({ onElementClick, selectedElement, correctElement }: PeriodicTableProps) {
  const getElementColor = (element: ElementData) => {
    if (selectedElement?.symbol === element.symbol) {
      if (correctElement === element.symbol) {
        return "bg-green-500 text-white hover:bg-green-600";
      }
      return "bg-red-500 text-white hover:bg-red-600";
    }
    
    switch (element.category) {
      case "alkali-metal":
        return "bg-pink-500/20 hover:bg-pink-500/30";
      case "alkaline-earth":
        return "bg-orange-500/20 hover:bg-orange-500/30";
      case "transition":
        return "bg-yellow-500/20 hover:bg-yellow-500/30";
      case "post-transition":
        return "bg-green-500/20 hover:bg-green-500/30";
      case "metalloid":
        return "bg-teal-500/20 hover:bg-teal-500/30";
      case "nonmetal":
        return "bg-blue-500/20 hover:bg-blue-500/30";
      case "noble-gas":
        return "bg-purple-500/20 hover:bg-purple-500/30";
      case "lanthanide":
        return "bg-indigo-500/20 hover:bg-indigo-500/30";
      case "actinide":
        return "bg-violet-500/20 hover:bg-violet-500/30";
      default:
        return "bg-gray-500/20 hover:bg-gray-500/30";
    }
  };

  // Create a grid with empty cells
  const grid = Array.from({ length: 10 }, () => Array.from({ length: 18 }, () => null));

  // Place elements in their correct positions
  elementData.forEach(element => {
    if (element.period <= 7) {
      grid[element.period - 1][element.group - 1] = element;
    } else if (element.period === 8) {
      // Lanthanides
      grid[8][element.group - 1] = element;
    } else if (element.period === 9) {
      // Actinides
      grid[9][element.group - 1] = element;
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px] p-4">
        <div className="grid grid-cols-18 gap-1">
          {grid.map((row, rowIndex) =>
            row.map((element, colIndex) =>
              element ? (
                <Card
                  key={element.symbol}
                  className={cn(
                    "element-card aspect-square flex flex-col items-center justify-center p-1 cursor-pointer transition-colors text-center",
                    getElementColor(element)
                  )}
                  onClick={() => onElementClick(element)}
                >
                  <div className="text-xs font-mono opacity-50">{element.atomicNumber}</div>
                  <div className="text-lg font-bold">{element.symbol}</div>
                  <div className="text-[10px] truncate w-full">{element.name}</div>
                </Card>
              ) : (
                <div key={`empty-${rowIndex}-${colIndex}`} className="aspect-square" />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
