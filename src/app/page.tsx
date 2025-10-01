import SudokuGrid from "@/components/sudoku/SudokuGrid";
import MistakeCounter from "@/components/sudoku/MistakeCounter";
import Timer from "@/components/sudoku/Timer";
import Pause from "@/components/sudoku/Pause";
import NumericButtons from "@/components/sudoku/NumericButtons";

export default function Page() {
  return (
    <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row-reverse lg:items-start lg:gap-6">
      <div className="flex items-center gap-4 justify-between">
        <Timer />
        <div className="flex items-center gap-x-2">
          <MistakeCounter />
          <Pause />
        </div>
      </div>
      <div className="space-y-3">
        <SudokuGrid />
        <NumericButtons />
      </div>
    </div>
  )
}