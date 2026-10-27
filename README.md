# Centralized Monitoring Platform for Railway Signaling Equipment, Maintenance, Fault Reporting & Compliance

> **Final-Year Engineering Degree Project in Computer Science / Information Technology**  
> **Full-Stack MERN Application (MongoDB, Express.js, React.js, Node.js)**

---

## 🚆 Project Overview

The **Centralized Monitoring Platform for Railway Signaling Equipment** is an enterprise-grade web application developed to modernize the supervision, maintenance scheduling, failure tracking, and regulatory safety compliance of railway signaling infrastructure. 

In railway networks, signaling systems—including **color-light signals, track circuits, point machines, digital axle counters, and solid-state interlocking systems**—must adhere to strict **SIL-4 (Safety Integrity Level 4)** standards. This platform eliminates manual logbooks by providing real-time telemetry, automated equipment status transitions upon fault dispatch, automated overdue maintenance tracking, algorithmic safety compliance scoring, and instant CSV audit exports.

---

## 🛠️ Technology Stack (MERN Only)

- **Database:** MongoDB (with Mongoose ODM & resilient auto-fallback)
- **Backend:** Express.js & Node.js (RESTful API architecture)
- **Frontend:** React.js (Vite build tool, Tailwind CSS, React Router v6)
- **Data Visualizations:** Recharts (Pie Chart, Bar Chart, Doughnut Chart, Line Chart)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt.js password hashing
- **Icons:** Lucide React
- **HTTP Client:** Axios (with request & response interceptors)

---

## 🔑 Demonstration Admin Credentials

The platform comes pre-configured with a default demonstration administrator account:

| Field | Credentials |
|---|---|
| **Portal URL** | `http://localhost:5173/login` |
| **Username** | `admin` *(or `admin@railway.gov.in`)* |
| **Password** | `admin123` |
| **Role** | Chief Signal Engineer (Admin) |
| **Quick Action** | Click the **"Auto-Fill"** button on the login screen |

---

## 📁 Project Folder Structure

```text
railway-monitoring-platform/
├── backend/
│   ├── config/
│   │   └── db.js               # Resilient MongoDB connector (Local / Atlas / In-Memory fallback)
│   ├── controllers/
│   │   ├── authController.js        # JWT Login, verify profile
│   │   ├── equipmentController.js   # Equipment CRUD, search, filter, history
│   │   ├── faultController.js       # Fault ticket dispatch & equipment auto-sync
│   │   ├── maintenanceController.js # Scheduling, completion & overdue recalculation
│   │   ├── complianceController.js  # Dynamic safety compliance metrics calculation
│   │   ├── dashboardController.js   # 6 live KPIs & 4 Recharts datasets
│   │   ├── notificationController.js# Real-time in-app alerts & read status
│   │   └── reportController.js      # Reports filtering & CSV generation
│   ├── middleware/
│   │   ├── authMiddleware.js        # Bearer JWT verification
│   │   └── errorHandler.js          # Centralized error handler
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt hashing
│   │   ├── Equipment.js             # 20+ Signaling asset attributes & health %
│   │   ├── FaultReport.js           # Fault tickets with severity & resolution
│   │   ├── Maintenance.js           # Maintenance orders with auto-overdue logic
│   │   └── Notification.js          # System alerts & failure notifications
│   ├── routes/                      # RESTful route declarations
│   ├── utils/
│   │   └── seedData.js              # Database seeder (20 equipment, 8 faults, 10 maintenance)
│   ├── .env                         # Server environment variables
│   ├── .env.example                 # Template for environment configuration
│   ├── package.json
│   └── server.js                    # Express app entry point & auto-seeder
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header with SIL-4 status & notifications
│   │   │   ├── Sidebar.jsx          # Dark navy sidebar navigation
│   │   │   ├── StatCard.jsx         # KPI metric card with color cues
│   │   │   ├── StatusBadge.jsx      # Green/Red/Orange status pills
│   │   │   ├── SeverityBadge.jsx    # Pulsing severity tags (Critical, High, Medium, Low)
│   │   │   ├── Modal.jsx            # Accessible responsive dialog
│   │   │   └── NotificationDropdown.jsx # Real-time notification drawer
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # User session & token state management
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login portal with demo credentials auto-fill
│   │   │   ├── Dashboard.jsx        # 6 Stat cards & 4 Recharts visualizations
│   │   │   ├── Equipment.jsx        # Asset inventory table, CRUD & search/filter
│   │   │   ├── FaultReports.jsx     # Incident logging & equipment status sync
│   │   │   ├── Maintenance.jsx      # Work orders, quick complete & overdue tracker
│   │   │   ├── Compliance.jsx       # Safety compliance index, gauges & breakdown
│   │   │   └── Reports.jsx          # Multi-tab audit reports with CSV export
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios API client
│   │   ├── App.jsx                  # React Router & protected routes
│   │   ├── index.css                # Tailwind CSS layers & scrollbars
│   │   └── main.jsx                 # React root renderer
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js               # API proxy configuration
├── package.json                     # Root orchestrator scripts
└── README.md                        # Documentation & viva defense guide
```

---

## 🚀 How to Run the Project (Step-by-Step)

### Prerequisites
- Node.js (v18, v20, v22 or v24 installed)
- npm (Node Package Manager)

---

### Step 1: Open the Project Directory

Open your terminal or PowerShell and navigate to the project directory:
```bash
cd "railway-monitoring-platform"
```

---

### Step 2: Install Dependencies

You can install all dependencies for both backend and frontend using the root command:
```bash
npm run install-all
```
*Or install separately:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### Step 3: MongoDB Database Configuration

The application is engineered to connect seamlessly to any of the following:

#### Option A: Zero-Configuration Built-In Engine (Recommended for College Demonstration)
If you don't have MongoDB installed locally or running, **you don't have to do anything!**  
The backend includes an automatic fallback that boots up an isolated MongoDB engine in memory and **automatically seeds all 20 equipment assets, 8 fault tickets, 10 maintenance orders, and the admin user**. Everything runs instantly out-of-the-box!

#### Option B: Local MongoDB Server
If you have MongoDB Community Server installed locally on port `27017`:
Ensure `backend/.env` has:
```env
MONGO_URI=mongodb://127.0.0.1:27017/railway_monitoring
```

#### Option C: MongoDB Atlas (Cloud)
To connect your free MongoDB Atlas cloud cluster:
1. Create a free cluster on [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Copy your connection URI and paste it in `backend/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/railway_monitoring?retryWrites=true&w=majority
```

---

### Step 4: Seed Sample Data (Optional)

If using a fresh local or Atlas MongoDB, run the seeder once:
```bash
cd backend
npm run seed
```
*(If the database is empty when the server starts, it will automatically populate this data for you).*

---

### Step 5: Start the Backend Server

In a terminal window:
```bash
cd backend
npm start
```
You will see:
```text
✅ MongoDB Connected
🚆 Railway Monitoring Backend running on port 5000 in development mode
📡 API Health: http://localhost:5000/api/health
```

---

### Step 6: Start the Frontend Application

In a separate terminal window:
```bash
cd frontend
npm run dev
```
You will see:
```text
  VITE v5.4.21  ready in 1500 ms
  ➜  Local:   http://localhost:5173/
```

Open **`http://localhost:5173`** in your browser!

---

## 📊 Core Modules & Specifications

### 1. Main Dashboard
- **6 Key Dynamic Metrics:**
  1. `Total Equipment`
  2. `Working Equipment` (Green)
  3. `Faulty Equipment` (Red)
  4. `Pending Maintenance` (Orange)
  5. `Open Fault Reports`
  6. `Compliance Percentage`
- **4 Interactive Recharts Data Visualizations:**
  1. **Equipment Status** – Interactive Pie Chart
  2. **Fault Severity** – High-contrast Bar Chart
  3. **Maintenance Status** – Multi-segment Doughnut Chart
  4. **Monthly Fault Reports** – 6-Month Incident Line Chart
- **Recent Telemetry Feeds:** Live list of newly reported faults and scheduled maintenance orders.

### 2. Equipment Management
- **Full CRUD:** Register new assets, modify parameters, view detailed history, or delete equipment.
- **Search & Filter:** Instant search by Equipment ID, Name, Station, or Type, with status filter dropdowns.
- **Visual Health Bars:** Dynamic color-coded battery bars reflecting equipment health (Green >80%, Amber 50-79%, Red <50%).
- **Asset Categories:**
  - Railway Signal Lights
  - Track Circuits
  - Point Machines
  - Axle Counters
  - Signal Control Units
  - Interlocking Systems

### 3. Fault Reporting Module
- **Automated Equipment Status Synchronization:** When a fault is reported against any equipment, its status is **automatically transitioned to "Faulty"** and its health percentage is reduced.
- **Severity Ratings:** Low, Medium, High, and Critical (with pulsing visual alerts).
- **Resolution Workflow:** When resolving a fault, the admin can enter resolution notes and choose to restore the equipment to **"Working"** (health reset to 95%) or **"Under Maintenance"**.
- **Real-Time Notification Generation:** Submitting a fault automatically pushes an alert to the top notification drawer.

### 4. Maintenance Management
- **Automatic Overdue Calculation:** If scheduled maintenance date is in the past and status is not `Completed`, the system automatically flags the record as **Overdue**.
- **One-Click Completion:** "Complete" button sets the completed date to today, resets equipment health to 98%, pushes next maintenance date ahead by 90 days, and marks the asset back to "Working".
- **Workflow States:** Scheduled, In Progress, Completed, Overdue.

### 5. Compliance Monitoring
- **Formula-Driven Compliance Rating:**
  $$\text{Compliance } \% = \left(\frac{\text{Equipment with Valid Maintenance}}{\text{Total Equipment}}\right) \times 100$$
- **Threshold Ratings:**
  - **$\ge 85\%$:** `Compliant` (Green)
  - **$70\% - 84\%$:** `Pending Inspection` (Amber)
  - **$< 70\%$:** `Non-Compliant` (Red)
- **Breakdown Charts:** Compliance by Equipment Type and Division Station.
- **Horizon Table:** Days remaining until next mandatory inspection with overdue alerts.

### 6. Reports & Data Export
- 4 Report Categories: Equipment Summary, Fault Incident Analysis, Maintenance Log, Compliance Audit.
- Date range filtering (Start Date to End Date).
- **Download CSV Button:** Generates and downloads standard comma-separated `.csv` files for offline verification by railway safety inspectors.

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns JWT token |
| `/api/auth/me` | `GET` | Private | Retrieves logged-in user profile |
| `/api/equipment` | `GET` | Public | Returns all equipment with search & filter |
| `/api/equipment` | `POST` | Private | Registers new signaling equipment |
| `/api/equipment/:id` | `GET` | Public | Returns single equipment with fault/maint history |
| `/api/equipment/:id` | `PUT` | Private | Updates equipment parameters |
| `/api/equipment/:id` | `DELETE` | Private | Deletes equipment from inventory |
| `/api/faults` | `GET` | Public | Returns all fault reports with filters |
| `/api/faults` | `POST` | Private | Creates fault ticket & sets equipment to Faulty |
| `/api/faults/:id` | `PUT` | Private | Updates fault status and resolution notes |
| `/api/faults/:id` | `DELETE` | Private | Deletes fault report |
| `/api/maintenance` | `GET` | Public | Returns maintenance records & checks overdue |
| `/api/maintenance` | `POST` | Private | Schedules new maintenance order |
| `/api/maintenance/:id` | `PUT` | Private | Updates maintenance / marks completed |
| `/api/maintenance/:id` | `DELETE` | Private | Deletes maintenance record |
| `/api/compliance` | `GET` | Public | Returns compliance statistics & breakdowns |
| `/api/dashboard` | `GET` | Public | Returns 6 KPI cards & 4 Recharts datasets |
| `/api/notifications` | `GET` | Public | Returns system alert notifications & unread count |
| `/api/notifications/mark-all-read` | `PUT` | Private | Marks all notifications as read |
| `/api/reports` | `GET` | Public | Retrieves aggregated report summaries |
| `/api/reports/csv` | `GET` | Public | Streams downloadable CSV audit report |

---

## 🎓 College Viva / Project Defense Q&A

**Q1: Why did you choose the MERN stack for this project?**  
> *Answer:* MERN (MongoDB, Express, React, Node) provides a unified JavaScript environment across the entire stack. React enables real-time component updates without full-page reloads, Node/Express handles high-throughput asynchronous telemetry requests efficiently, and MongoDB's flexible document structure easily accommodates varied railway equipment specifications and historical logs.

**Q2: How does the platform ensure fail-safe status updates when a fault occurs?**  
> *Answer:* In `faultController.js`, when a fault report is submitted, a transactional update immediately flags the corresponding equipment document's status as `Faulty` and reduces its health index. This guarantees that station dispatchers immediately see red indicators on the dashboard and equipment table.

**Q3: How is regulatory compliance calculated?**  
> *Answer:* Compliance is calculated mathematically based on valid inspection dates. Equipment that is either faulty or has an overdue maintenance date is classified as non-compliant. The ratio of compliant assets to total assets produces the compliance percentage, which is categorized into `Compliant` ($\ge 85\%$), `Pending Inspection` ($70-84\%$), or `Non-Compliant` ($<70\%$).

**Q4: How does JWT authentication work in this application?**  
> *Answer:* When the admin submits their credentials, bcrypt compares the salted hash with the stored hash. Upon validation, a signed JWT containing the user ID is returned. The frontend stores this token and attaches it to the `Authorization: Bearer <token>` header on protected API calls via Axios interceptors.

---

## 📜 Project Demonstration Checklist

- [x] Full-Stack MERN Implementation (MongoDB + Express + React + Node)
- [x] Professional Railway Industry Dark Navy Theme with Green/Red/Orange status cues
- [x] Secure JWT Login & Logout with Demo Account Auto-Fill
- [x] Dynamic Dashboard with 6 Live Counters & 4 Recharts Data Visualizations
- [x] Equipment Inventory Management (Full CRUD, Search, Status Filter, Health %)
- [x] Fault Incident Reporting with Auto-Sync to Equipment Status
- [x] Maintenance Scheduling with Auto-Overdue Logic & Quick-Complete
- [x] Regulatory Safety Compliance Monitoring with Gauges & Divisional Breakdown
- [x] Multi-Report Generator with Instant CSV Download
- [x] Real-Time Notification Bell Drawer
- [x] Sample Dataset Pre-Loaded (20 Equipment, 8 Faults, 10 Maintenance, 1 Admin)
- [x] Verified Zero-Error Execution
