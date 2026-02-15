import { Card, CardContent, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import ApexCharts from "react-apexcharts";

export default function Stats() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data from the backend API
  const fetchData = async () => {
    const res = await axios.get("http://localhost:5001/api/data");

    const formattedRows = res.data.map((row, index) => ({
      id: index + 1,
      name: row[0],
      waitTime: row[1],
      openSlots: row[2],
      dietary: row[3],
      timestamp: row[4],
      transcript: row[5],
      number: row[6],
    }));

    console.log("Formatted Rows:", formattedRows);

    setData(formattedRows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRestaurants = new Set(data.map((r) => r.name)).size;

  // Bar Graph
  const callsPerRestaurant = {};
  data.forEach((row) => {
    if (row.name) {
      callsPerRestaurant[row.name] = (callsPerRestaurant[row.name] || 0) + 1;
    }
  });

  console.log("Calls per Restaurant:", callsPerRestaurant);

  const sortedCalls = Object.entries(callsPerRestaurant).sort(
    ([, a], [, b]) => b - a,
  );

  const barCategories = sortedCalls.map(([name]) => name);
  const barData = sortedCalls.map(([, count]) => count);

  const barOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true } },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      title: { text: "Restaurant", style: { color: "#000000" } },
      labels: { style: { colors: "#000000" } },
    },
    dataLabels: { enabled: true },
  };

  const barSeries = [
    {
      name: "Calls",
      data: barData,
      color: "#000000",
    },
  ];

  // Line Chart
  const monthlyCalls = {};

  data.forEach((row) => {
    if (row.timestamp) {
      const date = new Date(row.timestamp);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      monthlyCalls[month] = (monthlyCalls[month] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthlyCalls).sort();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const lineOptions = {
    chart: { type: "line", toolbar: { show: false } },
    xaxis: {
      categories: sortedMonths.map((m) => {
        const [year, month] = m.split("-");
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }),
      title: { text: "Month" },
    },
    yaxis: { title: { text: "Restaurants Called" } },
    dataLabels: { enabled: true, colors: ["#0c0303"] },
    stroke: { curve: "smooth", colors: ["#000000"] },
  };

  const lineSeries = [
    {
      name: "Restaurants Called",
      data: sortedMonths.map((month) => monthlyCalls[month]),
      color: "#000000",
    },
  ];

  return (
    <div className="flex flex-col gap-10 p-4 w-full">

      <div className="relative w-full flex flex-col items-center -mb-16 z-10">
        <h2 className="text-black font-bold text-m mb-2">
          Total Calls
        </h2>
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-black font-bold italic text-xl">
            {totalRestaurants}
          </span>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">Calls per Restaurant</h2>
        <ApexCharts
          options={{
            ...barOptions,
            xaxis: { ...barOptions.xaxis, categories: barCategories },
          }}
          series={barSeries}
          type="bar"
          height={400}
        />
      </div>

      {/* Line Chart */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">Restaurants Called per Month</h2>
        <ApexCharts
          options={lineOptions}
          series={lineSeries}
          type="line"
          height={400}
        />
      </div>
    </div>
  );
}
