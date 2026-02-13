"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const ChartContext = React.createContext<any>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider")
  }
  return context
}

const ChartContainer = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    config?: any
    children: React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-muted-foreground",
          className
        )}
        {...props}
      >
        <ChartTooltip content={<ChartTooltipContent />} />
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    active?: boolean
    payload?: any[]
    label?: string
    labelFormatter?: (value: any, name: any) => React.ReactNode
    formatter?: (value: any, name: any) => React.ReactNode
    color?: string
    nameKey?: string
    labelKey?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    wrapperClassName?: string
  }
>(
  (
    {
      active,
      payload,
      label,
      labelFormatter,
      formatter,
      color,
      nameKey,
      labelKey,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      wrapperClassName,
      className,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config?.[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className="font-medium">
            {labelFormatter(value, name)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className="font-medium">{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-md",
          wrapperClassName
        )}
        {...props}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          <div className="flex w-full flex-wrap items-center gap-2.5">
            {payload.map((item, index) => {
              const key = `${labelKey || item?.dataKey || item?.name || "value"}`
              const itemConfig = getPayloadConfigFromPayload(config, item, key)
              const indicatorColor = color || itemConfig?.color

              return (
                <div
                  key={index}
                  className={cn(
                    "flex w-full flex-wrap items-center gap-2.5",
                    nestLabel ? "items-center" : "items-start"
                  )}
                >
                  {indicator && (
                    <div
                      className={cn(
                        "shrink-0 rounded-[2px] w-[2px] h-[2px]",
                        {
                          "bg-primary": indicator === "dot",
                          "bg-border": indicator === "line",
                          "bg-muted": indicator === "dashed",
                        }[indicator]
                      )}
                      style={{
                        backgroundColor: indicatorColor,
                      }}
                    />
                  )}
                  <div
                    className={cn(
                      "grid flex-1 gap-1",
                      nestLabel ? "items-center" : "items-start"
                    )}
                  >
                    {nestLabel ? tooltipLabel : null}
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-foreground">
                          {nameKey ? item[nameKey] : itemConfig?.label}
                        </div>
                      </div>
                      <div className="font-mono text-foreground">
                        {formatter
                          ? formatter(item.value, nameKey)
                          : item.value}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideIcon?: boolean
    nameKey?: string
    payload?: any[]
  }
>(
  ({ className, hideIcon = false, payload, nameKey }, ref) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          className
        )}
      >
        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-sm",
                item.color && "text-muted-foreground"
              )}
            >
              {item.payload && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label && (
                <div className="font-medium">{itemConfig.label}</div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

function getPayloadConfigFromPayload(
  config: any,
  payload: any,
  key: string
) {
  if (config?.[key]) {
    return config[key]
  }

  if (config?.payload && config.payload[key]) {
    return config.payload[key]
  }

  return undefined
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}