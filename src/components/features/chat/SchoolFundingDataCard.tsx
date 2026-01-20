import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AidCategory {
  name: string;
  change: string;
  pctChange: string;
}

interface SchoolFundingData {
  district: string;
  county: string;
  budgetYear: string;
  baseYearTotal: string;
  schoolYearTotal: string;
  totalChange: string;
  percentChange: string;
  categoryCount: string;
  categories: AidCategory[];
}

// Parse school funding data from the message content
export function parseSchoolFundingData(content: string): SchoolFundingData | null {
  // Check if this is a school funding message
  const schoolFundingMatch = content.match(/\[SchoolFunding:(\d+)\]/);
  if (!schoolFundingMatch) return null;

  try {
    // Extract district and county
    const districtMatch = content.match(/school funding for ([^in]+) in ([^County]+) County/i);
    const district = districtMatch?.[1]?.trim() || 'Unknown District';
    const county = districtMatch?.[2]?.trim() || 'Unknown County';

    // Extract budget year
    const budgetYearMatch = content.match(/for the ([^\s]+(?:\s+Enacted Budget)?)\s+budget year/i);
    const budgetYear = budgetYearMatch?.[1]?.trim() || '';

    // Extract summary values
    const baseYearMatch = content.match(/Base Year Total:\s*(\$[\d,]+)/);
    const schoolYearMatch = content.match(/School Year Total:\s*(\$[\d,]+)/);
    const totalChangeMatch = content.match(/Total Change:\s*(\$[\d,]+|-\$[\d,]+)\s*\(([^)]+)\)/);
    const categoryCountMatch = content.match(/Number of Aid Categories:\s*(\d+)/);

    // Extract aid categories
    const categories: AidCategory[] = [];
    const categoriesSection = content.match(/Aid Categories Breakdown:\n([\s\S]*?)(?:\n\nWhat|$)/);
    if (categoriesSection) {
      const categoryLines = categoriesSection[1].split('\n').filter(line => line.trim().startsWith('-'));
      for (const line of categoryLines) {
        const categoryMatch = line.match(/- ([^:]+):\s*(\$[\d,]+|-\$[\d,]+)\s*\(([^)]+)\)/);
        if (categoryMatch) {
          categories.push({
            name: categoryMatch[1].trim(),
            change: categoryMatch[2].trim(),
            pctChange: categoryMatch[3].trim(),
          });
        }
      }
    }

    return {
      district,
      county,
      budgetYear,
      baseYearTotal: baseYearMatch?.[1] || 'N/A',
      schoolYearTotal: schoolYearMatch?.[1] || 'N/A',
      totalChange: totalChangeMatch?.[1] || 'N/A',
      percentChange: totalChangeMatch?.[2] || 'N/A',
      categoryCount: categoryCountMatch?.[1] || '0',
      categories,
    };
  } catch {
    return null;
  }
}

interface SchoolFundingDataCardProps {
  data: SchoolFundingData;
}

export function SchoolFundingDataCard({ data }: SchoolFundingDataCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if change is positive or negative
  const isPositive = !data.totalChange.startsWith('-');

  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <div className="p-3">
        <div className="text-sm font-medium text-white mb-1">
          {data.district}
        </div>
        <div className="text-xs text-slate-300 mb-2">
          {data.county} County • {data.budgetYear}
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-slate-400">Total Change:</span>{' '}
            <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
              {data.totalChange} ({data.percentChange})
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible School Aid section */}
      <div className="border-t border-slate-600">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-300 hover:bg-slate-600 transition-colors"
        >
          <span>School Aid Categories ({data.categories.length})</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isExpanded && data.categories.length > 0 && (
          <ScrollArea className="max-h-48">
            <div className="px-3 pb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-600">
                    <th className="text-left py-1 pr-2">Aid Category</th>
                    <th className="text-right py-1 px-2">Change</th>
                    <th className="text-right py-1 pl-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categories.map((category, index) => {
                    const catIsPositive = !category.change.startsWith('-');
                    return (
                      <tr key={index} className="border-b border-slate-700 last:border-0">
                        <td className="py-1.5 pr-2 text-slate-200 truncate max-w-[180px]" title={category.name}>
                          {category.name}
                        </td>
                        <td className={`py-1.5 px-2 text-right ${catIsPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {category.change}
                        </td>
                        <td className={`py-1.5 pl-2 text-right ${catIsPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {category.pctChange}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}

        {isExpanded && data.categories.length === 0 && (
          <div className="px-3 pb-3 text-xs text-slate-400 italic">
            No aid category breakdown available
          </div>
        )}
      </div>
    </div>
  );
}
