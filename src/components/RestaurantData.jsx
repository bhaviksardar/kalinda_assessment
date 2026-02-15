import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";
import callResult from "./Phone";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function RestaurantData() {
  const [data, setData] = useState([]);
  const [now, setNow] = useState(new Date());

  // Update 'now' every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data from the backend API
  const fetchData = async () => {
    const res = await axios.get("http://localhost:5001/api/data");

    const updatedData = [...res.data, callResult];

    console.log(updatedData, "Updated data with call result", callResult);

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

  const getTimer = (timestamp, waitTime) => {
    if (!timestamp || !waitTime) return "";

    const startTime = new Date(timestamp);
    const waitMinutes = parseInt(waitTime);
    const endTime = new Date(startTime.getTime() + waitMinutes * 60000);

    const diff = Math.max(0, endTime - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let display = "";
    if (days > 0) display += `${days}d `;
    if (hours > 0 || days > 0) display += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) display += `${minutes}m `;
    display += `${seconds}s`;

    return display;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  // Map your JSON to DataGrid rows
  const rows = data.map((row) => ({
    id: row.id,
    name: row.name,
    waitTime: row.waitTime,
    openSlots: row.openSlots.split(",").map((s) => s.trim()),
    dietary: row.dietary.split(",").map((d) => d.trim()),
    number: row.number || "",
    timestamp: row.timestamp || "",
    date: formatDate(row.timestamp),
    transcript: row.transcript || "",

    timer: getTimer(row.timestamp, row.waitTime), // calculate timer for each row
  }));

  const columns = [
    { field: "date", headerName: "Date", width: 100 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "timer",
      headerName: "Live Wait Time ⏰",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "openSlots",
      headerName: "Open Slots",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const rowTimestamp = new Date(params.row.timestamp);
        const now = new Date();

        const isPast = rowTimestamp < now;

        return (
          <div className="flex flex-wrap gap-1 items-center justify-center h-full">
            {params.value.map((slot, index) => (
              <span
                key={`${params.id}-slot-${index}`}
                className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${
                  isPast
                    ? "bg-red-100 text-red-800 line-through"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {slot}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      field: "dietary",
      headerName: "Dietary Accommodations",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex flex-wrap gap-1 items-center justify-center h-full overflow-auto">
          {params.value.map((item, index) => (
            <span
              key={`${params.id}-${index}`}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </span>
          ))}
        </div>
      ),
    },
    {
      field: "number",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        const raw = params.value || "";

        if (!/^\d{11}$/.test(raw)) return raw;

        const country = raw[0];
        const area = raw.slice(1, 4);
        const prefix = raw.slice(4, 7);
        const line = raw.slice(7);

        const formatted = `+${country} (${area})-${prefix}-${line}`;

        return <span>{formatted}</span>;
      },
    },
    {
      field: "transcript",
      headerName: "Transcript",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <div
          className="w-full h-full overflow-auto"
          style={{
            whiteSpace: "pre-wrap",
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "",
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      align: "center",
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full">
          <button
            onClick={() => handleDeleteRow(params.id)}
            className="p-1 rounded-full hover:bg-red-100 flex items-center justify-center"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const handleDeleteRow = async (id) => {
    setData((prev) => prev.filter((row) => row.id !== id));

    console.log(`Row ${id} deleted in frontend`);

    try {
      const res = await axios.post("http://localhost:5001/api/data/delete", {
        rowIndex: id + 1,
      });

      if (res.data.success) {
        console.log(`Row ${id} deleted in backend successfully`);
      } else {
        console.warn("Backend deletion failed:", res.data);
      }
    } catch (error) {
      console.error("Failed to delete row in backend:", error);
    }
  };

  return (
    <div className="flex-1 w-full h-full">
      <DataGrid
        rows={rows}
        columns={columns}
        loading={data.length === 0}
        rowHeight={80}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
