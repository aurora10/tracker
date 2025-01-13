import { ShineBorder } from "./shine-border"

export function ShineBorderDemo() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <ShineBorder color="#A07CFE">
        <div className="text-2xl font-bold">Shine Border</div>
      </ShineBorder>

      <ShineBorder 
        color="#FE8FB5"
        borderWidth={2}
        borderRadius={12}
        duration={14}
      >
        <div className="text-2xl font-bold">Customized Border</div>
      </ShineBorder>
    </div>
  )
}

export function ShineBorderMonotone() {
  return (
    <ShineBorder color="#000000">
      <div className="text-2xl font-bold">Monotone Border</div>
    </ShineBorder>
  )
}
