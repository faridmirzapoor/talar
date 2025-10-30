"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import axios from "axios";
import moment from "moment-jalaali";

interface Hall {
  id: number;
  name_farsi: string;
  name_english: string;
  capacity: number;
  address: string;
  slug: string;
  image: string | null;
}

interface Event {
  id: number;
  title: string;
  hall: Hall;
  event_date: string;
  start_time: string;
  end_time: string;
  description?: string;
  student_id?: string;
  phone_number: string;
  image?: string | null;
  status: "PN" | "AP" | "RJ";
}

interface RequestedEventProps {
  event: Event;
  hall: Hall;
  onStatusChange?: (newStatus: Event["status"]) => void;
}

const RequestedEvent: React.FC<RequestedEventProps> = ({
  event,
  hall,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<Event["status"]>(event.status);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const statusColor = {
    PN: "bg-yellow-200 text-yellow-800 border border-yellow-400",
    AP: "bg-green-200 text-green-800 border border-green-400",
    RJ: "bg-red-200 text-red-800 border border-red-400",
  };

  const statusText = {
    PN: "در انتظار",
    AP: "تایید شده",
    RJ: "رد شده",
  };

  const handleChangeStatus = async (newStatus: Event["status"]) => {
    setIsChanging(true);
    try {
      await axios.patch(`http://127.0.0.1:8000/events/${event.id}/`, {
        status: newStatus,
      });
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("تغییر وضعیت موفقیت‌آمیز نبود!");
    } finally {
      setIsChanging(false);
    }
  };

  // تبدیل تاریخ و زمان به شمسی
  const eventDateShamsi = moment(event.event_date, "YYYY-MM-DD").format(
    "jYYYY-jMM-jDD"
  );
  const startTimeShamsi = moment(event.start_time, "HH:mm").format("HH:mm");
  const endTimeShamsi = moment(event.end_time, "HH:mm").format("HH:mm");

  return (
    <Card className="flex flex-col max-w-sm w-full mx-auto shadow-xl rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 mb-6">
      {event.image && (
        <div className="relative w-full h-64">
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
        <CardDescription className="text-lg text-gray-600">
          تالار {hall.name_farsi}
          <br />
          <p>📅 {eventDateShamsi}</p>
          <p>🕐 {startTimeShamsi} تا {endTimeShamsi}</p>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 text-gray-700 font-iransansL text-lg flex-1">
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
              <DialogTitle className="text-lg">تغییر وضعیت رویداد</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleChangeStatus("AP")}
                disabled={isChanging}
                className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? "در حال انجام..." : "تایید"}
              </Button>
              <Button
                onClick={() => handleChangeStatus("RJ")}
                disabled={isChanging}
                className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? "در حال انجام..." : "رد"}
              </Button>
              <Button
                onClick={() => handleChangeStatus("PN")}
                disabled={isChanging}
                className="bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? "در حال انجام..." : "در انتظار"}
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
  );
};

export default RequestedEvent;
