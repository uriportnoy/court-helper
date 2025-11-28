import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  ButtonGroup,
  Input,
} from "@/components/ui";
import { Star, ArrowDown, ArrowUp, X, Search } from "lucide-react";
import {
  AllValue,
  courts,
  monthNames,
  origins,
  typeLabels,
  typeColors,
  SortDirection,
} from "@/theTimeline/common";
import { useTimelineContext } from "@/theTimeline/context";
import GroupsDropdown from "../createEvent/GroupsDropdown";
import CasesDropdown from "../createEvent/CasesDropdown";
import type { Case } from "@/theTimeline/types";
import { useEffect } from "react";

interface TimelineFiltersControlsProps {
  layout?: "row" | "column";
  showCaseFilter?: boolean;
  clearClosesPanel?: boolean;
  onAfterClear?: () => void;
  onHasActiveFiltersChange?: (hasActiveFilters: boolean) => void;
}

export default function TimelineFiltersControls({
  layout = "row",
  showCaseFilter = false,
  clearClosesPanel = false,
  onAfterClear,
  onHasActiveFiltersChange,
}: TimelineFiltersControlsProps) {
  const {
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    filterCourt,
    setFilterCourt,
    sortDirection,
    setSortDirection,
    filterImportant,
    setFilterImportant,
    filterType,
    setFilterType,
    availableYears,
    availableMonths,
    clearFilters,
    hasActiveFilters,
    filterGroups,
    setFilterGroups,
    caseFilter,
    setCaseFilter,
    searchQuery,
    setSearchQuery,
  } = useTimelineContext();

  const isRow = layout === "row";

  const handleClear = () => {
    clearFilters();
    if (clearClosesPanel && onAfterClear) {
      onAfterClear();
    }
  };

  useEffect(() => {
    if (onHasActiveFiltersChange) {
      onHasActiveFiltersChange(hasActiveFilters);
    }
  }, [hasActiveFilters, onHasActiveFiltersChange]);

  const containerClass = isRow
    ? "w-full flex flex-wrap items-center gap-2 md:gap-3"
    : "w-full flex flex-col gap-4";

  const searchWrapperClass = isRow
    ? "flex-1 min-w-[240px] relative"
    : "w-full relative";

  return (
    <div className={containerClass}>
      {/* Search */}
      <div className={searchWrapperClass}>
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="חיפוש אירועים לפי כותרת, מספר תיק..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="חיפוש"
          className="pr-10 h-10 rounded-xl bg-white border-slate-200"
        />
      </div>
      {/* Year */}
      <div className={isRow ? "" : "space-y-2"}>
        {!isRow && (
          <label className="text-sm font-semibold text-slate-700">שנה</label>
        )}
        <Select
          value={filterYear}
          onValueChange={(value) => {
            setFilterYear(value);
            setFilterMonth("all");
          }}
        >
          <SelectTrigger
            className={
              isRow ? "w-36 md:w-40 h-10 rounded-xl" : "h-11 border-slate-300"
            }
          >
            <SelectValue placeholder={isRow ? "שנה" : "בחר שנה"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל השנים</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Month */}
      <div className={isRow ? "" : "space-y-2"}>
        {!isRow && (
          <label className="text-sm font-semibold text-slate-700">חודש</label>
        )}
        <Select
          value={filterMonth}
          onValueChange={setFilterMonth}
          disabled={filterYear === AllValue.ALL || filterYear === "all"}
        >
          <SelectTrigger
            className={
              isRow ? "w-36 md:w-40 h-10 rounded-xl" : "h-11 border-slate-300"
            }
          >
            <SelectValue placeholder={isRow ? "חודש" : "בחר חודש"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AllValue.ALL}>כל החודשים</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {monthNames[month]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Court */}
      <div className={isRow ? "" : "space-y-2"}>
        {!isRow && (
          <label className="text-sm font-semibold text-slate-700">
            בית משפט
          </label>
        )}
        <Select value={filterCourt} onValueChange={setFilterCourt}>
          <SelectTrigger
            className={
              isRow ? "w-36 md:w-40 h-10 rounded-xl" : "h-11 border-slate-300"
            }
          >
            <SelectValue placeholder={isRow ? "בית משפט" : "בחר בית משפט"} />
          </SelectTrigger>
          <SelectContent>
            {isRow && (
              <SelectItem value={AllValue.ALL}>כל בתי המשפט</SelectItem>
            )}
            {courts.map((c) => (
              <SelectItem
                key={isRow ? `court-select-${c}` : `floating-court-${c}`}
                value={c}
              >
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filters */}
      <div className={isRow ? "flex items-center gap-2" : "space-y-3"}>
        {!isRow && (
          <label className="text-sm font-semibold text-slate-700">
            סינון מהיר
          </label>
        )}
        <Button
          variant={filterImportant ? "default" : "outline"}
          size={isRow ? "lg" : "default"}
          onClick={() => setFilterImportant(!filterImportant)}
          className={
            filterImportant
              ? isRow
                ? "bg-amber-600 hover:bg-amber-700"
                : "w-full h-12 justify-start bg-amber-600 hover:bg-amber-700"
              : isRow
              ? ""
              : "w-full h-12 justify-start"
          }
        >
          <Star
            className={
              isRow
                ? "w-4 h-4 ml-2"
                : `w-5 h-5 ml-3 ${filterImportant ? "fill-white" : ""}`
            }
          />
          <span className="flex-1 text-right">
            {isRow ? "חשובים" : "אירועים חשובים"}
          </span>
          {filterImportant && !isRow && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </Button>

        <ButtonGroup
          className={
            isRow
              ? "h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-50"
              : "h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-50 w-full"
          }
        >
          {origins.map((origin) => (
            <Button
              key={`origin-button-${origin}`}
              variant={filterType === origin ? "default" : "ghost"}
              onClick={() => setFilterType(origin)}
              size="sm"
              className={`h-9 px-3 rounded-none text-xs transition-colors ${
                filterType === origin
                  ? `${
                      (typeColors as any)[origin] ||
                      "bg-blue-600 text-white border-blue-300"
                    }`
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="flex-1 text-right">{typeLabels[origin]}</span>
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Sort */}
      <Button
        variant="outline"
        size={isRow ? "icon" : "default"}
        onClick={() =>
          setSortDirection(
            sortDirection === SortDirection.ASC
              ? SortDirection.DESC
              : SortDirection.ASC
          )
        }
        className={isRow ? "" : "w-10 h-10 p-0"}
        title={
          sortDirection === SortDirection.ASC
            ? "מיין לפי תאריך עולה"
            : "מיין לפי תאריך יורד"
        }
      >
        {sortDirection === SortDirection.ASC ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
      </Button>

      {/* Groups */}
      <GroupsDropdown
        selected={filterGroups}
        onChange={(groups) => setFilterGroups(groups)}
        placeholder="חפש בקבוצות..."
      />

      {/* Case filter (optional) */}
      {showCaseFilter && (
        <CasesDropdown
          selectedCase={caseFilter as Case | null}
          setSelectedCase={setCaseFilter}
          placeholder="בחר תיק..."
        />
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className={isRow ? "" : "pt-2 border-t border-slate-200"}>
          <Button
            variant="outline"
            size={isRow ? "sm" : "default"}
            onClick={handleClear}
            className={
              isRow
                ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                : "w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            }
          >
            <X className="w-4 h-4 ml-2" />
            {isRow ? "נקה פילטרים" : "נקה את כל הפילטרים"}
          </Button>
        </div>
      )}
    </div>
  );
}
