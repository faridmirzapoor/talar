'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

interface Hall {
  id: number
  name_farsi: string
  name_english: string
  capacity: number
  address: string
  slug: string
  image: string | null
}

interface Applicant {
  student_id: string
  phone_number: string
  total_events: number
  pending_events: number
  approved_events: number
  rejected_events: number
}

interface Event {
  id: number
  hall: Hall
  title: string
  event_date: string
  start_time: string
  end_time: string
  description?: string
  student_id?: string
  phone_number: string
  image?: string | null
  status: 'PN' | 'AP' | 'RJ'
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// کامپوننت EventCard با قابلیت تغییر وضعیت
const EventCard: React.FC<{ 
  event: Event
  onStatusChange: (eventId: number, newStatus: Event['status']) => void
}> = ({ event, onStatusChange }) => {
  const [status, setStatus] = useState<Event['status']>(event.status)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const statusColor = {
    PN: "bg-yellow-200 text-yellow-800 border border-yellow-400",
    AP: "bg-green-200 text-green-800 border border-green-400",
    RJ: "bg-red-200 text-red-800 border border-red-400",
  }

  const statusText = {
    PN: "در انتظار",
    AP: "تایید شده",
    RJ: "رد شده"
  }

  const handleChangeStatus = async (newStatus: Event['status']) => {
    setIsChanging(true)
    try {
      await axios.patch(`${API_BASE_URL}/events/${event.id}/`, {
        status: newStatus,
      })
      setStatus(newStatus)
      onStatusChange(event.id, newStatus)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('خطا در تغییر وضعیت:', error)
      alert('تغییر وضعیت موفقیت‌آمیز نبود!')
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <Card className="flex flex-col max-w-sm w-full mx-auto shadow-xl rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
      {event.image && (
        <div className="relative w-full h-48">
          <Image
            src={`http://localhost:8000${event.image}`}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold">{event.title}</CardTitle>
        <CardDescription className="text-base text-gray-600">
          تالار {event.hall.name_farsi}
          <br />
          <p className="mt-1">{event.event_date}</p>
          <p>{event.start_time} تا {event.end_time}</p>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 text-gray-700 font-iransansL text-base flex-1">
        <p>{event.description || "توضیحی موجود نیست."}</p>
      </CardContent>

      <CardFooter className="flex justify-between items-center p-4 gap-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor[status]}`}
        >
          {statusText[status]}
        </span>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              تغییر وضعیت
            </Button>
          </DialogTrigger>
          <DialogContent className="space-y-4 rounded-lg p-4 font-iransansB">
            <DialogHeader>
              <DialogTitle className="text-lg">
                تغییر وضعیت رویداد
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleChangeStatus('AP')}
                disabled={isChanging}
                className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {isChanging ? 'در حال انجام...' : 'تایید'}
              </Button>
              <Button
                onClick={() => handleChangeStatus('RJ')}
                disabled={isChanging}
                className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isChanging ? 'در حال انجام...' : 'رد'}
              </Button>
              <Button
                onClick={() => handleChangeStatus('PN')}
                disabled={isChanging}
                className="bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {isChanging ? 'در حال انجام...' : 'در انتظار'}
              </Button>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isChanging}
              >
                بستن
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

// کامپوننت اصلی Applicants
const Applicants = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [studentEvents, setStudentEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  // Fetch لیست درخواست‌دهندگان
  const fetchApplicants = async (pageNum: number, isLoadMore = false) => {
    setLoading(true)
    try {
      const response = await axios.get<PaginatedResponse<Applicant>>(
        `${API_BASE_URL}/applicants/`,
        {
          params: {
            page: pageNum,
            page_size: pageNum === 1 ? 30 : 20,
            search: searchQuery
          }
        }
      )

      if (isLoadMore) {
        setApplicants(prev => [...prev, ...response.data.results])
      } else {
        setApplicants(response.data.results)
      }

      setHasMore(response.data.next !== null)
      setTotalCount(response.data.count)
    } catch (error) {
      console.error('خطا در دریافت درخواست‌دهندگان:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch ایونت‌های یک student_id خاص
  const fetchStudentEvents = async (studentId: string) => {
    setEventsLoading(true)
    try {
      const response = await axios.get<PaginatedResponse<Event>>(
        `${API_BASE_URL}/applicants/${studentId}/events/`
      )
      setStudentEvents(response.data.results)
    } catch (error) {
      console.error('خطا در دریافت ایونت‌های دانشجو:', error)
    } finally {
      setEventsLoading(false)
    }
  }

  // به‌روزرسانی وضعیت در state
  const handleEventStatusChange = (eventId: number, newStatus: Event['status']) => {
    setStudentEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      )
    )
    
    // به‌روزرسانی تعداد وضعیت‌ها در لیست applicants
    if (selectedStudent) {
      setApplicants(prev => prev.map(applicant => {
        if (applicant.student_id === selectedStudent) {
          const currentEvent = studentEvents.find(e => e.id === eventId)
          if (currentEvent) {
            const oldStatus = currentEvent.status
            return {
              ...applicant,
              pending_events: applicant.pending_events + (newStatus === 'PN' ? 1 : 0) - (oldStatus === 'PN' ? 1 : 0),
              approved_events: applicant.approved_events + (newStatus === 'AP' ? 1 : 0) - (oldStatus === 'AP' ? 1 : 0),
              rejected_events: applicant.rejected_events + (newStatus === 'RJ' ? 1 : 0) - (oldStatus === 'RJ' ? 1 : 0),
            }
          }
        }
        return applicant
      }))
    }
  }

  useEffect(() => {
    setPage(1)
    fetchApplicants(1, false)
  }, [searchQuery])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchApplicants(nextPage, true)
  }

  const handleApplicantClick = (studentId: string) => {
    setSelectedStudent(studentId)
    fetchStudentEvents(studentId)
  }

  const handleCloseEvents = () => {
    setSelectedStudent(null)
    setStudentEvents([])
  }

  return (
    <div className="font-estedadSB text-2xl p-6">
      <p className="mb-6">درخواست دهندگان ({totalCount} نفر)</p>

      {/* جستجو */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="جستجو بر اساس شماره دانشجویی یا شماره تماس..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-base font-iransans"
        />
      </div>

      {/* لیست درخواست‌دهندگان */}
      {!selectedStudent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {applicants.map((applicant) => (
              <div
                key={applicant.student_id}
                onClick={() => handleApplicantClick(applicant.student_id)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow bg-white"
              >
                <div className="text-lg font-bold mb-2">
                  شماره دانشجویی: {applicant.student_id}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  تلفن: {applicant.phone_number}
                </div>
                <div className="text-sm space-y-1">
                  <div>کل درخواست‌ها: {applicant.total_events}</div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-yellow-600">در انتظار: {applicant.pending_events}</span>
                    <span className="text-green-600">تایید: {applicant.approved_events}</span>
                    <span className="text-red-600">رد: {applicant.rejected_events}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* دکمه Load More */}
          {hasMore && (
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-3 text-base"
              variant="outline"
            >
              {loading ? 'در حال بارگذاری...' : 'بارگذاری 20 نفر بیشتر'}
            </Button>
          )}
        </>
      )}

      {/* نمایش ایونت‌های دانشجو */}
      {selectedStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              ایونت‌های شماره دانشجویی: {selectedStudent}
            </h3>
            <Button onClick={handleCloseEvents} variant="outline">
              بازگشت به لیست
            </Button>
          </div>

          {eventsLoading ? (
            <p className="text-center text-gray-500">در حال بارگذاری...</p>
          ) : studentEvents.length === 0 ? (
            <p className="text-center text-gray-500">ایونتی یافت نشد</p>
          ) : (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4">
              {studentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onStatusChange={handleEventStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Applicants
