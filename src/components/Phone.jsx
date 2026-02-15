import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MapboxNearbyView from "./Map";
import { PhoneIcon } from "@heroicons/react/24/solid";

export default function PhoneCall() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callResult, setCallResult] = useState(null);
  const [callId, setCallId] = useState(null);

  //Call
  const handleCall = async () => {
    if (!phoneNumber) {
      alert("Please enter a phone number!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/call", {
        phoneNumber: phoneNumber,
      });

      const data = response.data;

      console.log("Call response:", data);

      if (data.success) {
        setCallResult(data);
        setCallId(data.callId);
        alert(`Call completed!`);
      }

      setPhoneNumber("");
    } catch (error) {
      console.log("Error making call:", error);
      console.error(error);
      alert("Failed to make call");
    }
  };

  const handleTestCall = async () => {
    setCallId("019c5e5a-0b99-7cc5-945e-d22acf2d04e0");
  };

  async function fetchCallData(callId) {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/data/${callId}`,
      );

      const data = response.data;

      console.log("Fetched call data:", data);

      setCallResult(data);

      const sheetRes = await axios.post(
        "http://localhost:5001/api/data/append-call-meta",
        {
          timestamp: data.timestamp,
          transcript: data.transcript,
          number: data.number,
        },
      );

      console.log(
        "Appended to Google Sheets:",
        sheetRes.data,
        data.timestamp,
        data.transcript,
      );

      return data;
    } catch (error) {
      console.error(
        "Failed to fetch call data:",
        error.response?.data || error.message,
      );
      throw new Error("Could not fetch call data");
    }
  }

  useEffect(() => {
    fetchCallData(callId);
  }, [callId]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* Phone input and circular call button */}
      <div className="flex items-center gap-2 w-full max-w-md mx-auto">
        <input
          type="tel"
          placeholder="Enter Restaurant Number (w/ country code)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-black w-full"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        {/* Circular green button */}
        <button
          onClick={handleCall}
          className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
        >
          <PhoneIcon className="w-10 h-10 text-black" />
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 h-[600px] rounded-lg overflow-hidden border">
        <h2 className="text-lg font-bold mb-4 text-center w-full text-black">
          Nearby Restaurants
        </h2>
        <MapboxNearbyView />
      </div>
    </div>
  );
}
