"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDate, EventApi } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment-jalaali";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CalendarProps {
  talar: any;
}

const Calendar: React.FC<CalendarProps> = ({ talar }) => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const pastelColors = [
    "#BAFFC9",
    "#BAE1FF",
    "#FFFFBA",
    "#FFD9BA",
    "#E0BBE4",
    "#D4F1F4",
    "#FEC8D8",
  ];

  useEffect(() => {
    if (!talar || !talar.events) return;

    const approvedEvents = talar.events.filter(
      (task: any) => task.status === "AP"
    );
    const calendarEvents = approvedEvents.map((task: any, index: number) => ({
      id: String(task.id),
      title: task.title,
      start: moment(
        task.event_date + " " + task.start_time,
        "YYYY-MM-DD HH:mm"
      ).toDate(),
      end: moment(
        task.event_date + " " + task.end_time,
        "YYYY-MM-DD HH:mm"
      ).toDate(),
      description: task.description,
      image: task.image ? `http://127.0.0.1:8000${task.image}` : null, // لینک پوستر
      backgroundColor: pastelColors[index % pastelColors.length],
      borderColor: pastelColors[index % pastelColors.length],
      textColor: "#2C3E50",
    }));

    setCurrentEvents(calendarEvents);
  }, [talar]);

  const handleEventItemClick = (event: any) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("timeGridDay", event.start);
    }

    // باز یا بسته کردن collapsible
    setExpandedEventId((prev) => (prev === event.id ? null : event.id));
  };

  const handleCalendarEventClick = (event: any) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("timeGridDay", event.event.start);
    }
  };

  return (
    <div className="text-black">
      <div className="flex w-full px-10 justify-start items-start gap-8">
        {/* لیست رویدادها */}
        <div className="w-3/12 hidden desktop:block">
          <div className="py-10 text-2xl font-extrabold px-7">
            رویداد‌های پیش رو (تایید شده)
          </div>
          <ul className="space-y-4">
            {currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                هیچ رویداد تایید شده‌ای وجود ندارد
              </div>
            )}
            {currentEvents.map((event: any) => (
              <li
                key={event.id}
                className="border shadow-md px-4 py-3 rounded-lg transition-all hover:shadow-lg cursor-pointer"
                style={{
                  backgroundColor: event.backgroundColor,
                  borderColor: event.borderColor,
                }}
              >
                <div onClick={() => handleEventItemClick(event)}>
                  <div className="font-bold text-lg mb-2">{event.title}</div>
                  <div className="text-sm text-gray-700">
                    📅{" "}
                    {formatDate(event.start, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      locale: "fa",
                    })}
                  </div>
                  <div className="text-sm text-gray-700">
                    🕐{" "}
                    {new Intl.DateTimeFormat("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }).format(event.start)}
                    {" - "}
                    {new Intl.DateTimeFormat("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }).format(event.end)}
                  </div>
                </div>

                {/* collapsible نمایش پوستر */}
                {event.image && (
                  <Collapsible open={expandedEventId === event.id}>
                    <CollapsibleContent className="mt-2">
                      <img
                        src={event.image}
                        alt="پوستر رویداد"
                        className="w-full rounded-md shadow-md"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* تقویم */}
        <div className="w-full desktop:w-9/12 mt-8">
          <FullCalendar
            ref={calendarRef}
            height="85vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            buttonText={{
              today: "امروز",
              day: "روز",
              week: "هفته",
              month: "ماه",
            }}
            initialView="timeGridWeek"
            editable={false}
            selectable={false}
            selectMirror={true}
            dayMaxEvents={true}
            eventClick={handleCalendarEventClick}
            locale="fa"
            direction="rtl"
            firstDay={6}
            events={currentEvents}
            eventClassNames="rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
