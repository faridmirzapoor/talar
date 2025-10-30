"use client"

import axios from "axios"
import RequestedEvent from "./components/requestedEvent"
import React, { useEffect, useState, useCallback } from "react"
import { Combobox } from "@components/ui/combobox"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@components/ui/select"

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

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Event[]
}

export default function Page() {
  const [halls, setHalls] = useState<Hall[]>([])
  const [eventsByHall, setEventsByHall] = useState<Record<number, Event[]>>({})
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null)

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PN" | "AP" | "RJ">("ALL")
  
  const [pageByHall, setPageByHall] = useState<Record<number, number>>({})
  const [hasMoreByHall, setHasMoreByHall] = useState<Record<number, boolean>>({})
  const [totalCountByHall, setTotalCountByHall] = useState<Record<number, number>>({})
  const [loadingByHall, setLoadingByHall] = useState<Record<number, boolean>>({})

  // گرفتن همه تالارها
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const hallsResponse = await axios.get("http://127.0.0.1:8000/halls/")
        setHalls(hallsResponse.data)
      } catch (error) {
        console.error("Error fetching halls:", error)
      }
    }
    fetchHalls()
  }, [])

  const fetchEvents = useCallback(
    async (hall: Hall, page: number, append: boolean = false) => {
      const hallId = hall.id
      if (loadingByHall[hallId]) return
      setLoadingByHall(prev => ({ ...prev, [hallId]: true }))

      try {
        const ordering = sortOrder === "newest" 
          ? "-event_date,-start_time" 
          : "event_date,start_time"

        const response = await axios.get<PaginatedResponse>(
          `http://127.0.0.1:8000/${hall.name_english}/events/`,
          {
            params: {
              page,
              page_size: 5,
              status: statusFilter !== "ALL" ? statusFilter : undefined,
              ordering,
            },
          }
        )

        const newEvents = response.data.results
        const hasNext = response.data.next !== null
        const totalCount = response.data.count

        setEventsByHall(prev => ({
          ...prev,
          [hallId]: append ? [...(prev[hallId] || []), ...newEvents] : newEvents,
        }))
        setPageByHall(prev => ({ ...prev, [hallId]: page }))
        setHasMoreByHall(prev => ({ ...prev, [hallId]: hasNext }))
        setTotalCountByHall(prev => ({ ...prev, [hallId]: totalCount }))
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoadingByHall(prev => ({ ...prev, [hallId]: false }))
      }
    },
    [statusFilter, sortOrder, loadingByHall]
  )

  useEffect(() => {
    if (halls.length === 0) return
    const hallsToFetch = selectedHall ? [selectedHall] : halls

    hallsToFetch.forEach(hall => {
      setEventsByHall(prev => ({ ...prev, [hall.id]: [] }))
      setPageByHall(prev => ({ ...prev, [hall.id]: 1 }))
      setHasMoreByHall(prev => ({ ...prev, [hall.id]: false }))
      fetchEvents(hall, 1, false)
    })
  }, [halls.length, selectedHall, statusFilter, sortOrder])

  const handleLoadMore = (hall: Hall) => {
    const currentPage = pageByHall[hall.id] || 1
    const nextPage = currentPage + 1
    fetchEvents(hall, nextPage, true)
  }

  const hallsToShow = selectedHall ? [selectedHall] : halls

  return (
    <div className="font-estedadSB text-2xl">
      <p className="mb-6">داشبورد ادمین</p>

      {/* Combobox تالار */}
      <div className="mb-4">
        <Combobox
          hallsWithEvents={halls.map(hall => ({
            hall,
            events: eventsByHall[hall.id] || []
          }))}
          onSelectHall={setSelectedHall}
        />
      </div>

      {/* فیلتر وضعیت و مرتب‌سازی با shadcn Select */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-48 h-12">
            <SelectValue placeholder="مرتب‌سازی" />
          </SelectTrigger>
          <SelectContent className="font-iransans">
            <SelectItem value="newest">جدیدترین</SelectItem>
            <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-12">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent className="font-iransans">
            <SelectItem value="ALL">همه</SelectItem>
            <SelectItem value="PN">در حال انتظار</SelectItem>
            <SelectItem value="AP">تأیید شده</SelectItem>
            <SelectItem value="RJ">رد شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* نمایش تالارها و رویدادها */}
      {hallsToShow.map(hall => {
        const hallId = hall.id
        const hallEvents = eventsByHall[hallId] || []
        const hasMore = hasMoreByHall[hallId]
        const isLoading = loadingByHall[hallId]
        const totalCount = totalCountByHall[hallId] || 0

        return (
          <div key={hall.id} className="my-6">
            <h2 className="text-xl font-bold mb-2">
              تالار {hall.name_farsi} 
              {totalCount > 0 && ` (${hallEvents.length} از ${totalCount} رویداد)`}
            </h2>
            
            {isLoading && hallEvents.length === 0 ? (
              <p className="text-gray-500 text-base">در حال بارگذاری...</p>
            ) : hallEvents.length === 0 ? (
              <p className="text-gray-500 text-base">رویدادی یافت نشد</p>
            ) : (
              <>
                <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4 w-full">
                  {hallEvents.map(event => (
                    <RequestedEvent
                      key={`hall-${hallId}-event-${event.id}`}
                      event={event}
                      hall={hall}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleLoadMore(hall)}
                      disabled={isLoading}
                      className="text-base"
                    >
                      {isLoading ? "در حال بارگذاری..." : "بارگذاری 5 رویداد بیشتر"}
                    </Button>
                  </div>
                )}

                {isLoading && hallEvents.length > 0 && (
                  <p className="text-center text-gray-500 text-base mt-2">
                    در حال بارگذاری...
                  </p>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
