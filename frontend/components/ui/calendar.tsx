"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment-jalaali";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarProps {
  talar: any;
}

const Calendar: React.FC<CalendarProps> = ({ talar }) => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const events = talar.events || [];
        const calendarEvents = events.map((task: any) => {
          const startDateTime = moment(task.event_date + " " + task.start_time, "jYYYY-jMM-jDD HH:mm").toDate();
          const endDateTime = moment(task.event_date + " " + task.end_time, "jYYYY-jMM-jDD HH:mm").toDate();

          return {
            id: task.id,
            title: task.title,
            start: startDateTime,
            end: endDateTime,
            description: task.description,
          };
        });

        setCurrentEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (talar && talar.events) {
      fetchTasks();
    }
  }, [talar]);

  const handleDateClick = (selected: DateSelectArg) => {
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected: EventClickArg) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle) {
      setNewEventTitle("");
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    const element = document.querySelector('[aria-labelledby="fc-dom-16"]');

    if (element) {
      element.classList.add("overflow-x-auto");
    }
  }, []);

  return (
    <div className="text-black">
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12 hidden desktop:block">
          <div className="py-10 text-2xl font-extrabold px-7">
            Calendar Events
          </div>
          <ul className="space-y-4">
            {currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No Events Present
              </div>
            )}

            {currentEvents.length > 0 &&
              currentEvents.map((event: EventApi) => (
                <li
                  className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                  key={`${event.id}-${event.start}`} // Ensure a unique key using a combination of `id` and `start`
                >
                  {event.title}
                  <br />
                  <label className="text-slate-950">
                    {formatDate(event.start!, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      locale: "fa",
                    })}
                  </label>
                </li>
              ))}
          </ul>
        </div>

        <div className="w-full desktop:w-9/12 mt-8">
          <div className="calendar-scroll-container fc-direction-rtl">
            <FullCalendar
              height={"85vh"}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              initialView="timeGridWeek"
              editable={false}
              selectable={false}
              selectMirror={true}
              dayMaxEvents={true}
              slotMinWidth={100} // Minimum width for each day column
              select={handleDateClick}
              eventClick={handleEventClick}
              locale="fa"
              dir="rtl"
              firstDay={6}
              weekNumberCalculation="local"
              weekends={true}
              events={currentEvents}
            />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="space-x-5 mb-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <button
              className="bg-green-500 text-white p-3 mt-5 rounded-md"
              type="submit"
            >
              Add
            </button>{" "}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
