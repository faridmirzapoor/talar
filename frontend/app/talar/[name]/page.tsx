"use client";

import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@components/ui/select";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Calendar from "@components/ui/calendar";

const BackgroundImageComponent = ({ imageUrl, children }) => {
  return (
    <div
      className="bg-center bg-no-repeat bg-cover h-screen w-full flex justify-center items-center text-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {children}
    </div>
  );
};

interface Talar {
  id: number; // یا string بسته به نوع شناسه
  name_farsi: string;
  name_english: string;
  hall: {
    id: number;
    capacity: number;
    address: string;
  };
}

import moment from "moment-jalaali";

const TalarPage = () => {
  const [talar, setTalar] = useState<Talar | null>(null);
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
          const response = await axios.get(
            `http://127.0.0.1:8000/halls/${name}`
          );
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

  useEffect(() => {
    console.log(talar);
  }, [talar]);

  if (!talar) {
    return <div>Loading...</div>;
  }

  const onSubmit = async (data) => {
    const formattedEventDate = moment(data.event_date, "jYYYY-jMM-jDD").format(
      "YYYY-MM-DD"
    );

    const formattedStartTime = moment(data.start_time, "HH:mm").format("HH:mm");
    const formattedEndTime = moment(data.end_time, "HH:mm").format("HH:mm");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/halls/${data.talarName}/reserve/`,
        {
          hall: talar.hall.id,
          title: data.title,
          event_date: formattedEventDate,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          description: data.description,
          student_id: data.student_id,
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
            <BackgroundImageComponent
              imageUrl={`http://localhost:8000/media/halls_images/${talar.name_farsi}.jpg`}
            >
              <div>
                <h1 className="bg-white p-2 rounded-sm glass_morph text-2xl">تالار: {talar.name_farsi}</h1>
                <div className="flex justify-center items-center gap-8 mt-2">
                  <div className="flex flex-col flex-[1] justify-center items-center w-36 h-32 bg-red-500 rounded-lg p-2">
                    <span>ظرفیت:</span>
                    <span>{talar.hall.capacity} نفر</span>
                  </div>
                  <div className="flex flex-col flex-[3] justify-center items-center w-36 h-32 bg-red-500 rounded-lg p-2">
                    <span>مکان:</span>
                    <span className="text-center">{talar.hall.address}</span>
                  </div>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    variant="outline"
                    className="flex-[1] h-full text-black hover:text-white hover:bg-stone-700 hover:border-2 p-6"
                  >
                    رزرو
                  </Button>
                </div>
              </div>
            </BackgroundImageComponent>
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
                    type="time" // استفاده از input نوع time برای نمایش زمان به صورت 24 ساعته
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
                    type="time" // استفاده از input نوع time برای نمایش زمان به صورت 24 ساعته
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
              {/* Add new fields if needed */}
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="توضیحات"
                    className="w-full h-20 bg-white px-4"
                  />
                )}
              />
              <Controller
                name="student_id"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="کد دانشجویی"
                    className="w-full h-14 bg-white px-4"
                  />
                )}
              />

              <Button type="submit" variant="outline" className="h-14">
                {isSubmitting ? "...در حال ارسال" : "ثبت درخواست"}
              </Button>
            </form>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">
              بستن
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalarPage;
