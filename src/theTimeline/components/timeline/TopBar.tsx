import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, X, ArrowDown, ArrowUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ButtonGroup,
} from "@/components/ui";
import {
  AllValue,
  courts,
  monthNames,
  origins,
  SortDirection,
  typeLabels,
} from "../../common";
import { useTimelineContext } from "@/theTimeline/context";
import GroupsDropdown from "../createEvent/GroupsDropdown";

export default function TopBar() {
  const {
    searchQuery,
    setSearchQuery,
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
  } = useTimelineContext();

  return (
    <div className="rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200/50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex flex-wrap items-center gap-2 md:gap-3">
      <div className="flex-1 min-w-[220px] relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="חיפוש אירועים לפי כותרת, מספר תיק..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="חיפוש"
          className="pr-10 h-10 rounded-xl bg-white border-slate-200"
        />
      </div>
      <Select
        value={filterYear}
        onValueChange={(value) => {
          setFilterYear(value);
          setFilterMonth("all");
        }}
      >
        <SelectTrigger className="w-36 md:w-40 h-10 rounded-xl">
          <SelectValue placeholder="שנה" />
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

      <Select
        value={filterMonth}
        onValueChange={setFilterMonth}
        disabled={filterYear === AllValue.ALL}
      >
        <SelectTrigger className="w-36 md:w-40 h-10 rounded-xl">
          <SelectValue placeholder="חודש" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AllValue.ALL}>כל החודשים</SelectItem>
          {availableMonths.map((month) => (
            <SelectItem key={`month-${month}`} value={month.toString()}>
              {monthNames[month]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterCourt} onValueChange={setFilterCourt}>
        <SelectTrigger className="w-36 md:w-40 h-10 rounded-xl">
          <SelectValue placeholder="בית משפט" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AllValue.ALL}>כל בתי המשפט</SelectItem>
          {courts.map((c) => (
            <SelectItem key={`court-${c}`} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={filterImportant ? "default" : "outline"}
        size="lg"
        onClick={() => setFilterImportant(!filterImportant)}
        className={filterImportant ? "bg-amber-600 hover:bg-amber-700" : ""}
      >
        <Star className="w-4 h-4 ml-2" />
        חשובים
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          setSortDirection(
            sortDirection === SortDirection.ASC
              ? SortDirection.DESC
              : SortDirection.ASC
          )
        }
        size="icon"
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

      <ButtonGroup>
        {origins.map((origin) => (
          <Button
            variant={filterType === origin ? "default" : "outline"}
            onClick={() => setFilterType(origin)}
            className={`w-full h-12 justify-start ${
              filterType === origin ? "bg-blue-600 hover:bg-blue-700" : ""
            }`}
          >
            <span className="flex-1 text-right">{typeLabels[origin]}</span>
            {filterType === origin && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </Button>
        ))}
      </ButtonGroup>
      <GroupsDropdown
                selected={filterGroups}
                onChange={(groups) => setFilterGroups(groups)}
                placeholder="חפש בקבוצות..."
              />
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <X className="w-4 h-4 ml-2" />
          נקה פילטרים
        </Button>
      )}
    </div>
  );
}
