import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const TABS = [
  { title: "Việc đang xử lý" },
  { title: "Doanh số kinh doanh" },
  { title: "Bảng xếp hạng" },
  { title: "Sự kiện sắp tới" },
];

function renderTabContent(index) {
  switch (index) {
    case 0:
      return <TaskTab />;
    case 1:
      return <SalesTab />;
    case 2:
      return <RankingTab />;
    case 3:
      return <EventTab />;
    default:
      return null;
  }
}

function MainContainer({
  activeTab,
  setActiveTab,
  showTabs,
  isZoomed,
  toggleFullScreen,
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1920px",
        aspectRatio: "16/9",
        position: "relative",
        padding: "2rem",
        color: "white",
        transform: isZoomed ? "scale(1)" : "scale(0.8)",
        transformOrigin: "top center",
        transition: "transform 1s ease-in-out",
        overflow: "hidden",
      }}
    >
      {showTabs && (
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2 items-center transition-opacity duration-500 backdrop-blur-md bg-white/20 p-2 rounded"
          style={{ zIndex: 10 }}
        >
          <button
            onClick={toggleFullScreen}
            style={{ width: "150px", height: "40px" }}
            className="flex justify-center items-center text-lg rounded font-medium text-white"
          >
            Toàn màn hình
          </button>
          {TABS.map((tab, idx) => (
            <button
              key={idx}
              style={{ width: "150px", height: "40px" }}
              className={`flex justify-center items-center text-lg rounded font-medium ${
                activeTab === idx
                  ? "bg-white text-black"
                  : "bg-blue-400 text-black"
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.title}
            </button>
          ))}
        </div>
      )}
      <div
        className="bg-white/10 rounded-lg p-8 overflow-y-auto flex items-center justify-center"
        style={{
          height: "calc(100% - 120px)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {renderTabContent(activeTab)}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [showTabs, setShowTabs] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const hideTimer = useRef(null);

  // Tự động chuyển tab mỗi 10 giây
  useEffect(() => {
    const cycle = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % TABS.length);
    }, 10000);
    return () => clearInterval(cycle);
  }, []);

  // Ẩn các nút tabs và nút toàn màn hình sau 3 giây không di chuyển chuột
  useEffect(() => {
    const resetTimer = () => {
      setShowTabs(true);
      document.body.style.cursor = "auto"; // hiển thị con trỏ
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setShowTabs(false);
        document.body.style.cursor = "none"; // ẩn con trỏ
      }, 3000);
    };
    resetTimer();
    const handleMouseMove = () => resetTimer();
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(hideTimer.current);
    };
  }, []);

  // Sau 3 giây tự động phóng to giao diện
  useEffect(() => {
    const zoomTimer = setTimeout(() => {
      setIsZoomed(true);
    }, 3000);
    return () => clearTimeout(zoomTimer);
  }, []);

  // Hàm chuyển đổi chế độ toàn màn hình
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) =>
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          )
        );
    } else {
      document.exitFullscreen();
    }
  };

  return (
    // Wrapper ngoài có cursor được điều chỉnh theo state showTabs
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(to bottom right, #f97316, #3b82f6, #1e3a8a)",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // Khi showTabs = false, ẩn con trỏ chuột
        cursor: showTabs ? "auto" : "none",
      }}
    >
      <MainContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showTabs={showTabs}
        isZoomed={isZoomed}
        toggleFullScreen={toggleFullScreen}
      />
      {/* Clock đặt ngoài container chính để không bị ảnh hưởng bởi transform */}
      <Clock />
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        fontSize: "2rem",
        color: "white",
        fontWeight: "bold",
        zIndex: 9999,
      }}
    >
      {time.toLocaleTimeString("vi-VN")}
    </div>
  );
}

function TaskTab() {
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    fetch(
      "https://opensheet.elk.sh/1Iyh3jxIgakC4iSTqEsLngo6DcQ6MaRNmmf_ROwcRuS0/Sheet1"
    )
      .then((res) => res.json())
      .then((rows) => {
        // Lọc các task theo giá trị của cột "Progress"
        const inProgress = rows.filter(
          (row) => parseFloat(row["Progress"]) < 100
        );
        const completed = rows.filter(
          (row) => parseFloat(row["Progress"]) === 100
        );
        setInProgressTasks(inProgress);
        setCompletedTasks(completed);
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu Task:", err));
  }, []);

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {/* Cột bên trái: Task đang xử lý */}
      <div
        style={{
          flex: 1,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "0.5rem",
          padding: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          Task đang xử lý
        </h2>
        <table
          style={{ width: "100%", color: "white", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "center",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Feature Name
              </th>
              <th
                style={{
                  textAlign: "center",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Progress
              </th>
              <th
                style={{
                  textAlign: "center",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Projected Completion Time
              </th>
            </tr>
          </thead>
          <tbody>
            {inProgressTasks.map((task, index) => (
              <tr
                key={index}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <td style={{ padding: "0.5rem 0", textAlign: "center" }}>
                  {task["Feature Name"]}
                </td>
                <td style={{ padding: "0.5rem 0", textAlign: "center" }}>
                  {task["Progress"]}
                </td>
                <td style={{ padding: "0.5rem 0", textAlign: "center" }}>
                  {task["Projected Completion Time"]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cột bên phải: Task hoàn thành, chỉ hiển thị cột Feature Name với chữ màu trắng */}
      <div
        style={{
          width: "30%",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "0.5rem",
          padding: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          Task hoàn thành
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "center",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                Feature Name
              </th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map((task, index) => (
              <tr
                key={index}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <td
                  style={{
                    padding: "0.5rem 0",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {task["Feature Name"]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesTab() {
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);

  // Hàm safeParse xử lý giá trị VND: loại bỏ "VND" và dấu phẩy
  function safeParse(value) {
    if (!value) return 0;
    let str = value.toString().toUpperCase().replace("VND", "").trim();
    str = str.replace(/,/g, ""); // loại bỏ dấu phẩy phân cách hàng nghìn
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  useEffect(() => {
    fetch(
      "https://opensheet.elk.sh/115z85tEK2jdQ-RN2e_WDopp6OOWEud23ro3nN8MbRu4/DoanhSoNam"
    )
      .then((res) => res.json())
      .then((rows) => {
        // Map dữ liệu theo cột: "Tháng", "Doanh số HCM", "Doanh số HN", "Tổng"
        let cleaned = rows.map((row) => {
          const month = row["Tháng"]?.trim() || "";
          return {
            month,
            hcm: safeParse(row["Doanh số HCM"]) / 1000000000,
            hn: safeParse(row["Doanh số HN"]) / 1000000000,
            total: safeParse(row["Tổng"]) / 1000000000,
          };
        });

        // Loại bỏ những dòng có "Tháng" bằng 0 (ví dụ: "Tháng 0")
        cleaned = cleaned.filter((item) => {
          const monthNumber = parseInt(item.month.replace(/\D/g, "")) || 0;
          return monthNumber > 0;
        });

        // Sắp xếp dữ liệu theo thứ tự tăng dần (từ tháng 1 trở đi)
        cleaned.sort((a, b) => {
          const mA = parseInt(a.month.replace(/\D/g, "")) || 0;
          const mB = parseInt(b.month.replace(/\D/g, "")) || 0;
          return mA - mB;
        });

        // Lọc dữ liệu đến tháng cuối cùng có giá trị (total > 0)
        let lastNonZeroIndex = -1;
        cleaned.forEach((item, index) => {
          if (item.total > 0) {
            lastNonZeroIndex = index;
          }
        });
        const filtered =
          lastNonZeroIndex >= 0
            ? cleaned.slice(0, lastNonZeroIndex + 1)
            : cleaned;

        setData(filtered);
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu:", err));
  }, []);

  // Hiệu ứng vẽ đường: hiển thị dần dữ liệu từ trái sang phải, mỗi điểm thêm sau 1000ms
  useEffect(() => {
    if (data.length > 0) {
      let index = 0;
      const interval = setInterval(() => {
        index++;
        if (index <= data.length) {
          setDisplayData(data.slice(0, index));
        } else {
          clearInterval(interval);
        }
      }, 500); // Delay 1000ms giữa các điểm
      return () => clearInterval(interval);
    }
  }, [data]);

  return (
    <div>
      <h2
        className="font-bold text-white mb-8"
        style={{ fontSize: "2rem", textAlign: "center" }}
      >
        Doanh số năm 2025
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="month" tick={{ fill: "white", fontSize: 20 }} />
          <YAxis tick={{ fill: "white", fontSize: 20 }} unit=" tỷ" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e3a8a",
              color: "white",
              fontSize: 18,
            }}
            formatter={(value) => value.toFixed(2)}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              fontWeight: "bold",
              color: "white",
              marginTop: 10,
              fontSize: 20,
            }}
          />
          <Line
            type="linear"
            dataKey="hcm"
            name="Doanh số HCM"
            stroke="#ff5f00"
            strokeWidth={2}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
          <Line
            type="linear"
            dataKey="hn"
            name="Doanh số HN"
            stroke="#10b981"
            strokeWidth={2}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
          <Line
            type="linear"
            dataKey="total"
            name="Tổng"
            stroke="#facc15"
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RankingTab() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(
      "https://opensheet.elk.sh/115z85tEK2jdQ-RN2e_WDopp6OOWEud23ro3nN8MbRu4/ExportTV"
    )
      .then((res) => res.json())
      .then((rows) => {
        const cleaned = rows.map((row) => ({
          name: row["Tên"] || row["B"] || "Không tên",
          score: parseInt(row["Điểm"] || row["A"] || "0", 10),
        }));
        setData(cleaned);
      });
  }, []);
  return (
    <div>
      <h2
        className=" font-bold text-white mb-8"
        style={{ fontSize: "2rem", textAlign: "center" }}
      >
        Top 5 Kinh Doanh Xuất Sắc Quý
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="name" tick={{ fill: "white", fontSize: 20 }} />
          <YAxis tick={{ fill: "white", fontSize: 20 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e3a8a",
              color: "white",
              fontSize: 18,
            }}
          />
          <Bar dataKey="score" fill="#ffc603" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EventTab() {
  const [events, setEvents] = useState([]);

  function parseDate(dateStr) {
    const [dd, mm, yyyy] = dateStr.split("/");
    return new Date(`${yyyy}-${mm}-${dd}`);
  }

  useEffect(() => {
    fetch(
      "https://opensheet.elk.sh/1FpDhs8GI55SOlJcm2KiZ9sgMqfKANvcu4WZppk38d9s/Sheet1"
    )
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const upcoming = data
          .map((e) => ({
            startDate: parseDate(e["Ngày bắt đầu"]),
            endDate: parseDate(e["Ngày kết thúc"]),
            name: e["Sự kiện"],
            imageUrl: e["Ảnh mô tả"],
          }))
          .filter((e) => e.endDate >= now)
          .sort((a, b) => a.startDate - b.startDate);
        setEvents(upcoming);
      });
  }, []);

  const now = new Date();
  const leftEvents = events.filter(
    (e) =>
      e.startDate.getMonth() === now.getMonth() &&
      e.startDate.getFullYear() === now.getFullYear() &&
      e.imageUrl
  );
  const rightEvents = events.filter((e) => !leftEvents.includes(e));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "1.5rem",
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
    >
      <div style={{ overflowY: "auto" }}>
        <h2
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "1.5rem",
          }}
        >
          Sự kiện trong tháng
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {leftEvents.map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: "1.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <img
                src={e.imageUrl}
                alt={e.name}
                style={{
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                  height: "100px",
                  width: "auto",
                }}
                onError={() => console.warn("Lỗi ảnh:", e.imageUrl)}
              />
              <div>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  {e.name}
                </p>
                <p style={{ color: "#fff", fontSize: "1.25rem" }}>
                  {e.startDate.toLocaleDateString("vi-VN")} -{" "}
                  {e.endDate.toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          overflowY: "auto",
          borderLeft: "1px solid #4B5563",
          paddingLeft: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "1.5rem",
          }}
        >
          Các sự kiện khác
        </h3>
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingRight: "1.5rem",
          }}
        >
          {rightEvents.map((e, i) => (
            <li
              key={i}
              style={{
                color: "#fff",
                fontSize: "1.25rem",
                lineHeight: "1.5rem",
              }}
            >
              {e.startDate.toLocaleDateString("vi-VN")} -{" "}
              {e.endDate.toLocaleDateString("vi-VN")}: {e.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
