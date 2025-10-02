import { SudokuBoard } from "@/components/organisms";
import { NumericPad, ControlButtons, Pause, Timer, MistakeCounter } from "@/components/molecules";

export default function Page() {
  return (
    <div className="space-y-4 items-center mx-auto max-w-xl">
      <div className="space-y-3">
        <div className="flex items-center gap-4 justify-between">
          <Timer />
          <div className="flex items-center gap-x-2">
            <MistakeCounter />
            <Pause />
          </div>
        </div>
        <SudokuBoard />
        <NumericPad />
        <ControlButtons />
      </div>
    </div>
  )
}