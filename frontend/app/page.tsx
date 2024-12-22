"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select"; // Import your Select component correctly
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form"; // Correct import
import Image from "next/image";
import axios from "axios"; // Correct import
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  talarName: string;
};

const Index = () => {
  const [talars, setTalars] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTalars = async () => {
      try {
        const talarResponse = await axios({
          url: "http://127.0.0.1:8000/halls/",
          method: "GET",
        });
        setTalars(talarResponse.data);
        console.log(talars);
      } catch (error) {
        console.error("Error fetching talars:", error);
      }
    };
    fetchTalars();
  }, []);

  useEffect(() => {
    console.log(talars);
  }, [talars]);

  const {
    handleSubmit,
    control, // Use control to integrate react-hook-form with custom inputs
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const submitForm = async (
    data: FormData,
    { method } = { method: "post" }
  ) => {
    try {
      router.push(`/talar/${data.talarName}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    await submitForm(data, { method: "post" });
  };

  return (
    <div className="font-estedadSB min-h-screen flex flex-col">
      <div className="w-full relative vmini:h-[300px] tablet:h-[400px] desktop:h-[450px] bg-[#191970]">
        <div
          className="bg-hero absolute w-full h-full animate-blurBackground blur-[8px]"
          style={{
            animationDuration: "6s",
            animationIterationCount: 1,
          }}
        ></div>

        <div
          className="absolute top-[70%] right-[50%] translate-x-[50%] text-center font-black text-lg tablet:text-3xl desktop:text-4xl text-white animate-fadeInOut flex items-center gap-4"
          style={{
            animationDuration: "6s",
            animationIterationCount: 1,
          }}
        >
          <Image
            width={72}
            height={72}
            src="/img/logo2.png"
            alt="logo2"
            className="w-10 h-9 cursor-pointer animate-bounce animate-twice animate-duration-[50s] animate-delay-[50s] animate-ease-in-out"
            style={{
              animationDuration: "2.5s",
            }}
          />
          <p className="font-iransansB">سامانه رزرو تالار های دانشگاه</p>
        </div>
      </div>
      <div className="flex justify-center pt-10 bg-gradient flex-grow">
        <div className="bgSection">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-row-reverse gap-4"
          >
            <Controller
              name="talarName"
              control={control}
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value} // Bind the value to the form state
                  onValueChange={field.onChange} // Update form state with onChange
                >
                  <SelectTrigger className="w-[40vw] h-14 bg-white">
                    <SelectValue placeholder="محل برگزاری" />
                  </SelectTrigger>
                  <SelectContent className="font-estedadSB">
                    {talars.length > 0 ? (
                      talars.map((talar, index) => (
                        <SelectItem key={index} value={talar.name_english}>
                          تالار {talar.name_farsi}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="default" disabled>
                        داده‌ای یافت نشد
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <Button type="submit" variant="outline" className="h-14">
              {isSubmitting ? "...در حال دریافت" : "دریافت اطلاعات"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
