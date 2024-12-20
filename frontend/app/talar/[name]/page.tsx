'use client'

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "@components/ui/calendar"; // Make sure this path is correct

const TalarPage = () => {
  const [talar, setTalar] = useState<any>(null);
  const params = useParams();
  const router = useRouter();
  const { name } = params;

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
    if (talar) {
      console.log(talar.events);
    }
  }, [talar]);

  if (!talar) {
    return <div>Loading...</div>;
  }

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
            </div>
          </div>
        </div>
      </div>
      {talar && <Calendar talar={talar} />}
    </div>
  );
};

export default TalarPage;
