"use client"; // Mark this component as a Client Component

import { useRouter } from 'next/navigation'; // Correct import for Client Components
import { useEffect, useState } from 'react';
import axios from 'axios';

const TalarPage = ({ params }: { params: { name: string } }) => {
  const [talar, setTalar] = useState<string[]>([]);
  const { name } = params;
  const router = useRouter()

  useEffect(() => {
    const fetchTalars = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/halls/${name}`);
        setTalar(response.data);
      } catch (error) {
        console.error("Error fetching talars:", error);
      }
    };
    if (name) {
      fetchTalars();
    }
  }, [name]);

  useEffect(() => {
    console.log(talar);
  }, [talar]);

  const submitForm = async (data: { talarName: string }) => {
    try {
      router.push(`/talar/${data.talarName}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="font-estedadSB">
      <div className="w-full relative">
        <h1>Dynamic Talar Name: {talar.name_farsi}</h1>
        {/* Your other JSX */}
        <button onClick={() => submitForm({ talarName: name })}>Submit</button>
      </div>
    </div>
  );
};

export default TalarPage;
