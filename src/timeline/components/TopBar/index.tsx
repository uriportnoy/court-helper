import { useAppContext } from "timeline/Context";
import AddNewCase from "../AddNewCase.tsx";
import AddNewEvent from "../AddNewEvent";
import CasesDropdown from "../CasesDropdown.tsx";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { useCallback, useEffect, useMemo, useState } from "react";
import TextFilter from "./TextFilter.js";
import { filterConfig } from "./utils.ts";

interface FilterConfig {
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  ascending: boolean;
  setAscending: (ascending: boolean) => void;
}
function TopBar({
  filters,
  setFilters,
  ascending,
  setAscending,
}: FilterConfig) {
  const { loadEvents, groups, timelineData } = useAppContext();
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const eventsByYear = useMemo(() => {
    const sorted = [...timelineData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sorted.reduce((acc, event) => {
      const year = new Date(event.date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    }, {});
  }, [timelineData]);

  const years = useMemo(() => {
    return Object.keys(eventsByYear)
      .map(Number)
      .sort((a, b) => b - a);
  }, [eventsByYear]);

  const scrollToYear = (year) => {
    setSelectedYear(year);
    const elements = document.querySelectorAll(`[data-year="${year}"]`);
    if (elements.length > 0) {
      const headerOffset = 120;
      const elementPosition = elements[0].getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional: for smooth scrolling
    });
  }, []);
  const onSetFilters = (key, val) => {
    scrollToTop();
    setFilters((draft) => {
      if (!val || (Array.isArray(val) && val.length === 0)) {
        delete draft[key];
        return;
      }
      draft[key] = val;
    });
  };

  const clearFilters = () => {
    scrollToTop();
    setFilters({});
    setSelectedYear(null);
  };

  const yearOptions = useMemo(() => {
    return years.map((year) => ({
      label: `${year} (${eventsByYear[year].length})`,
      value: year,
    }));
  }, [years, eventsByYear]);

  const renderFilter = (filter) => {
    const baseInputClasses =
      "w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm";

    switch (filter.type) {
      case "case":
        return (
          <CasesDropdown
            selectedCaseNumber={filters.caseNumber}
            onChange={(selectedCase) => {
              setFilters((draft) => {
                if (!selectedCase) {
                  delete draft.caseNumber;
                  return;
                }
                draft.caseNumber = selectedCase.caseNumber;
              });
            }}
            className={`${baseInputClasses} min-w-[200px]`}
            placeholder={filter.label}
          />
        );

      case "dropdown":
        return (
          <Dropdown
            value={filters[filter.field] || null}
            options={filter.options}
            onChange={(e) => onSetFilters(filter.field, e.value)}
            placeholder={filter.label}
            className={baseInputClasses}
          />
        );

      case "multiSelect":
        const options = filter.optionsKey ? groups : filter.options;
        return (
          <MultiSelect
            value={filters[filter.field] || []}
            options={options}
            onChange={(e) => onSetFilters(filter.field, e.value)}
            optionLabel={filter.labelField || "label"}
            optionValue={filter.valueField || "value"}
            placeholder={filter.label}
            className={baseInputClasses}
            display="chip"
          />
        );

      case "text":
        return (
          <TextFilter
            value={filters[filter.field] || ""}
            onChange={(text) => onSetFilters(filter.field, text)}
            placeholder={filter.label}
            className={baseInputClasses}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm  shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AddNewEvent
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              loadEvents={loadEvents}
              caseNumber={filters.caseNumber}
            />
            <AddNewCase
              label="C"
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
            />
            <span onClick={clearFilters}>נקה</span>
            <Button
              icon={
                ascending ? "pi pi-sort-amount-up" : "pi pi-sort-amount-down"
              }
              onClick={() => setAscending(!ascending)}
              className="w-10 h-10 p-0 rounded-full"
              severity="secondary"
              aria-label={ascending ? "סדר יורד" : "סדר עולה"}
            />
          </div>

          <div className="flex-1 overflow-x-auto">
            {isMobile ? (
              <div className="flex justify-center">
                <Dropdown
                  value={selectedYear}
                  options={yearOptions}
                  onChange={(e) => scrollToYear(e.value)}
                  placeholder="בחר שנה"
                  className="w-full max-w-[200px] text-center"
                  panelClassName="text-right"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => scrollToYear(year)}
                    className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${
                      selectedYear === year
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                  >
                    {year}
                    <span className="ml-1 text-xs opacity-75">
                      ({eventsByYear[year].length})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            icon={expandedFilters ? "pi pi-chevron-up" : "pi pi-chevron-down"}
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="w-10 h-10 p-0 rounded-full"
            severity="secondary"
            aria-label={expandedFilters ? "צמצם סינון" : "הרחב סינון"}
          />
        </div>

        <div
          className={`
            grid gap-4 transition-all duration-300 ease-in-out
            ${
              expandedFilters
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 opacity-100 max-h-96 mt-4"
                : "max-h-0 opacity-0 overflow-hidden"
            }
          `}
        >
          {filterConfig.map((filter) => (
            <div key={filter.field} className="min-w-[200px]">
              <div className="text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </div>
              {renderFilter(filter)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
