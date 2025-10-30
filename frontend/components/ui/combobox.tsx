"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Hall {
  id: number
  name_farsi: string
  name_english: string
  capacity: number
  address: string
  slug: string
  image: string | null
}

interface Event {
  id: number
  title: string
  hall: Hall
  event_date: string
  start_time: string
  end_time: string
  description?: string
  student_id?: string
  phone_number: string
  image?: string | null
  status: "PN" | "AP" | "RJ"
}

interface HallWithEvents {
  hall: Hall
  events: Event[]
}

export function Combobox({
  hallsWithEvents,
  onSelectHall,
}: {
  hallsWithEvents: HallWithEvents[]
  onSelectHall: (hall: Hall | null) => void
}) {
  const halls = hallsWithEvents.map((item) => item.hall)
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const selectedHall = halls.find((hall) => hall.name_farsi === value)

  React.useEffect(() => {
    onSelectHall(selectedHall || null)
  }, [selectedHall, onSelectHall])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedHall ? selectedHall.name_farsi : "تالار را انتخاب کنید..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="جستجوی تالار..." />
          <CommandList>
            <CommandEmpty>تالاری یافت نشد</CommandEmpty>
            <CommandGroup>
              {halls.map((hall) => (
                <CommandItem
                  key={hall.id}
                  value={hall.name_farsi}
                  className="font-iransans"
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === hall.name_farsi ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {hall.name_farsi}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
