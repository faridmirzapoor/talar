"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@components/ui/select";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "@components/ui/calendar";

const TalarPage = () => {
  const [talar, setTalar] = useState(null);
  const [talars, setTalars] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { name } = params;

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchTalar = async () => {
      try {
        if (name) {
          const response = await axios.get(`http://127.0.0.1:8000/halls/${name}`);
          setTalar(response.data);
        }
      } catch (error) {
        console.error("Error fetching talar:", error);
      }
    };

    fetchTalar();
  }, [name]);

  useEffect(() => {
    const fetchTalars = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/halls/");
        setTalars(response.data);
      } catch (error) {
        console.error("Error fetching talars:", error);
      }
    };

    fetchTalars();
  }, []);

  if (!talar) {
    return <div>Loading...</div>;
  }

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/halls/${data.talarName}/reserve/`,
        {
          title: data.title,
          event_date: data.event_date,
          start_time: data.start_time,
          end_time: data.end_time,
          phone_number: data.phone_number,
        }
      );
      alert("درخواست رزرو با موفقیت ثبت شد!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting reservation:", error);
      alert("ثبت درخواست رزرو ناموفق بود.");
    }
  };

  return (
    <div className="font-estedadSB text-white">
      <div className="w-full relative">
        <div className="font-estedadSB flex flex-col">
          <div className="w-full relative vmini:h-[300px] tablet:h-[400px] desktop:h-[450px] bg-[#191970] flex flex-col items-center justify-center gap-4">
            <h1>تالار: {talar.name_farsi}</h1>
            <div className="flex justify-center items-center gap-8">
              <div className="flex flex-col flex-[1] justify-center items-center w-36 h-28 bg-red-500 rounded-lg">
                <span>ظرفیت:</span>
                <span>{talar.hall.capacity} نفر</span>
              </div>
              <div className="flex flex-col flex-[3] justify-center items-center w-36 h-28 bg-red-500 rounded-lg">
                <span>مکان:</span>
                <span className="text-center">{talar.hall.address}</span>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="flex-[1] h-full text-black hover:text-white hover:bg-stone-700 hover:border-2"
              >
                رزرو
              </Button>
            </div>
          </div>
        </div>
      </div>

      {talar && <Calendar talar={talar} />}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رزرو تالار</DialogTitle>
          </DialogHeader>
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="talarName"
                control={control}
                defaultValue={name || ""}
                render={({ field }) => (
                  <Select
                    dir="rtl"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-14 bg-white">
                      <SelectValue placeholder="محل برگزاری" />
                    </SelectTrigger>
                    <SelectContent className="font-estedadSB">
                      {talars.map((talar, index) => (
                        <SelectItem key={index} value={talar.name_english}>
                          تالار {talar.name_farsi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name="title"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="عنوان رویداد"
                    className="w-full h-14 bg-white px-4"
                  />
                )}
              />
              <Controller
                name="event_date"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="w-full h-14 bg-white px-4"
                  />
                )}
              />
              <Controller
                name="start_time"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="time"
                    className="w-full h-14 bg-white px-4"
                  />
                )}
              />
              <Controller
                name="end_time"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="time"
                    className="w-full h-14 bg-white px-4"
                  />
                )}
              />
              <Controller
                name="phone_number"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="شماره تماس"
                    className="w-full h-14 bg-white px-4"
                  />
                )}
              />
              <Button type="submit" variant="outline" className="h-14">
                {isSubmitting ? "...در حال ارسال" : "ثبت درخواست"}
              </Button>
            </form>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">بستن</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalarPage;
