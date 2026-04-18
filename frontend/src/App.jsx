import { useEffect, useRef, useState } from "react";
import SectionCard from "./components/SectionCard";

const defaultTableState = {
  items: [],
  query: "",
  page: 1,
  size: 5,
  sortBy: "",
  sortDirection: "asc",
  totalItems: 0,
  totalPages: 1,
  loading: false
};

const emptyPatient = {
  fullName: "",
  age: "",
  gender: "Female",
  phone: "",
  email: "",
  address: "",
  chiefComplaint: "",
  medicalHistory: "",
  lastVisit: ""
};

const emptyDoctor = {
  fullName: "",
  specialization: "Homeopathy",
  availability: "",
  phone: "",
  room: ""
};

const emptyAppointment = {
  patientId: "",
  patientName: "",
  doctorId: "",
  doctorName: "",
  appointmentDate: "",
  status: "Scheduled",
  notes: "",
  remedyPlan: ""
};

const api = {
  get: async (path) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  },
  post: async (path, payload) => {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  },
  put: async (path, payload) => {
    const response = await fetch(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  },
  delete: async (path) => {
    const response = await fetch(path, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
  }
};

function getPatientRouteId() {
  const match = window.location.hash.match(/^#\/patients\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function openPatientPage(patientId) {
  window.location.hash = `#/patients/${encodeURIComponent(patientId)}`;
}

function goToDashboard() {
  window.location.hash = "#/";
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-CA");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function toDateTimeInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60 * 1000);
  return normalized.toISOString().slice(0, 16);
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConfirmDialog({ item, onCancel, onConfirm }) {
  if (!item) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">Delete this record?</h3>
        <p>
          You are about to delete <strong>{item.label}</strong>. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientLink({ patientId, label }) {
  return (
    <button type="button" className="link-button" onClick={() => openPatientPage(patientId)}>
      {label}
    </button>
  );
}

function truncateText(value, maxLength = 28) {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}...` : value;
}

function HoverText({ value, maxLength }) {
  const text = value || "-";

  return (
    <span className="truncate-text" title={text}>
      {truncateText(text, maxLength)}
    </span>
  );
}

function DataTable({
  title,
  columns,
  rows,
  query,
  page,
  size,
  totalItems,
  totalPages,
  loading,
  searchPlaceholder,
  onSearchChange,
  onPageChange,
  onSizeChange,
  sortBy,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
  showActions = true
}) {
  const columnCount = columns.length + (showActions ? 1 : 0);
  const startIndex = rows.length === 0 ? 0 : (page - 1) * size + 1;
  const endIndex = rows.length === 0 ? 0 : startIndex + rows.length - 1;

  function toggleSort(column) {
    if (!column.sortKey || !onSortChange) {
      return;
    }

    const nextDirection = sortBy === column.sortKey && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(column.sortKey, nextDirection);
  }

  function getSortIndicator(column) {
    if (!column.sortKey || sortBy !== column.sortKey) {
      return "";
    }

    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <input
          className="table-search"
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <select className="table-size" value={size} onChange={(event) => onSizeChange(Number(event.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.sortKey ? (
                  <button type="button" className="sort-button" onClick={() => toggleSort(column)}>
                    {column.label}
                    <span>{getSortIndicator(column)}</span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {showActions ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columnCount} className="empty-state">
                Loading records...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="empty-state">
                {query ? "No matching records found." : "No records yet."}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key] || "-"}
                  </td>
                ))}
                {showActions ? (
                  <td className="action-cell">
                    <button type="button" className="edit-button" onClick={() => onEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="danger-button" onClick={() => onDelete(row)}>
                      Delete
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="table-footer">
        <p>
          {totalItems === 0 ? `No ${title.toLowerCase()} to show` : `Showing ${startIndex}-${endIndex} of ${totalItems}`}
        </p>
        <div className="pagination">
          <button type="button" className="ghost-button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" className="ghost-button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientDetailView({ detail, onBack }) {
  const { loading, patient, appointments } = detail;

  return (
    <main className="app-shell">
      <section className="hero detail-hero">
        <div>
          <p className="eyebrow">Patient Detail</p>
          <h2>{patient?.fullName || "Patient record"}</h2>
          <p className="hero-copy">View the full profile, contact information, case notes, and appointment history for this patient.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onBack}>
          Back To Dashboard
        </button>
      </section>

      {loading ? <div className="alert">Loading patient details...</div> : null}

      {patient ? (
        <section className="detail-grid">
          <SectionCard title="Profile Overview">
            <div className="detail-card-grid">
              <article className="detail-card"><span>Age</span><strong>{patient.age ?? "-"}</strong></article>
              <article className="detail-card"><span>Gender</span><strong>{patient.gender || "-"}</strong></article>
              <article className="detail-card"><span>Phone</span><strong>{patient.phone || "-"}</strong></article>
              <article className="detail-card"><span>Last Visit</span><strong>{formatDate(patient.lastVisit)}</strong></article>
            </div>
          </SectionCard>

          <SectionCard title="Patient Information">
            <div className="detail-stack">
              <div><span>Email</span><strong>{patient.email || "-"}</strong></div>
              <div><span>Address</span><strong>{patient.address || "-"}</strong></div>
              <div><span>Chief Complaint</span><strong>{patient.chiefComplaint || "-"}</strong></div>
              <div><span>Medical History</span><strong>{patient.medicalHistory || "-"}</strong></div>
            </div>
          </SectionCard>

          <SectionCard title="Related Appointments" subtitle="All consultations connected to this patient.">
            <div className="detail-list">
              {appointments.length === 0 ? (
                <p className="empty-copy">No appointments found for this patient yet.</p>
              ) : (
                appointments.map((appointment) => (
                  <article className="detail-list-card" key={appointment.id}>
                    <div className="detail-list-header">
                      <strong>{appointment.doctorName}</strong>
                      <span>{appointment.status}</span>
                    </div>
                    <p>{formatDateTime(appointment.appointmentDate)}</p>
                    <p>Notes: {appointment.notes || "-"}</p>
                    <p>Remedy Plan: {appointment.remedyPlan || "-"}</p>
                  </article>
                ))
              )}
            </div>
          </SectionCard>
        </section>
      ) : null}
    </main>
  );
}

export default function App() {
  const patientIntakeRef = useRef(null);
  const patientNameInputRef = useRef(null);
  const [routePatientId, setRoutePatientId] = useState(getPatientRouteId());
  const [patientDetail, setPatientDetail] = useState({ loading: false, patient: null, appointments: [] });
  const [dashboard, setDashboard] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    nextAppointments: []
  });
  const [patientTable, setPatientTable] = useState({
    ...defaultTableState,
    sortBy: "fullName",
    sortDirection: "asc"
  });
  const [doctorTable, setDoctorTable] = useState(defaultTableState);
  const [appointmentTable, setAppointmentTable] = useState({
    ...defaultTableState,
    sortBy: "appointmentDate",
    sortDirection: "desc"
  });
  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleHashChange = () => setRoutePatientId(getPatientRouteId());
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  async function requestTable(resource, { query, page, size, sortBy, sortDirection }) {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      size: String(size),
      sortBy,
      sortDirection
    });
    return api.get(`/api/${resource}?${params.toString()}`);
  }

  async function fetchTable(resource, tableState, setTableState) {
    setTableState((current) => ({ ...current, loading: true }));
    try {
      const data = await requestTable(resource, tableState);
      setTableState((current) => ({
        ...current,
        items: data.items,
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        page: data.currentPage,
        size: data.pageSize,
        loading: false
      }));
    } catch (requestError) {
      setTableState((current) => ({ ...current, loading: false }));
      throw requestError;
    }
  }

  async function loadOptions() {
    const [patientData, doctorData] = await Promise.all([
      api.get("/api/patients?page=1&size=15"),
      api.get("/api/doctors?page=1&size=15")
    ]);

    setPatientOptions(patientData.items);
    setDoctorOptions(doctorData.items);
  }

  async function loadData() {
    try {
      setLoading(true);
      const dashboardData = await api.get("/api/dashboard");
      setDashboard(dashboardData);
      await Promise.all([
        fetchTable("patients", patientTable, setPatientTable),
        fetchTable("doctors", doctorTable, setDoctorTable),
        fetchTable("appointments", appointmentTable, setAppointmentTable),
        loadOptions()
      ]);
      setError("");
    } catch (requestError) {
      setError("Unable to load clinic data. Start the Spring Boot API and check MongoDB.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!routePatientId) {
      loadData();
    }
  }, [routePatientId]);

  useEffect(() => {
    if (routePatientId) {
      return;
    }
    fetchTable("patients", patientTable, setPatientTable).catch(() => setError("Unable to load patient records."));
  }, [patientTable.page, patientTable.size, patientTable.query, patientTable.sortBy, patientTable.sortDirection, routePatientId]);

  useEffect(() => {
    if (routePatientId) {
      return;
    }
    fetchTable("doctors", doctorTable, setDoctorTable).catch(() => setError("Unable to load doctor records."));
  }, [doctorTable.page, doctorTable.size, doctorTable.query, routePatientId]);

  useEffect(() => {
    if (routePatientId) {
      return;
    }
    fetchTable("appointments", appointmentTable, setAppointmentTable).catch(() => setError("Unable to load appointment records."));
  }, [appointmentTable.page, appointmentTable.size, appointmentTable.query, appointmentTable.sortBy, appointmentTable.sortDirection, routePatientId]);

  useEffect(() => {
    if (!routePatientId) {
      setPatientDetail({ loading: false, patient: null, appointments: [] });
      return;
    }

    let active = true;
    setPatientDetail({ loading: true, patient: null, appointments: [] });
    Promise.all([
      api.get(`/api/patients/${routePatientId}`),
      api.get(`/api/patients/${routePatientId}/appointments`)
    ])
      .then(([patient, appointments]) => {
        if (!active) {
          return;
        }
        setPatientDetail({ loading: false, patient, appointments });
        setError("");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setPatientDetail({ loading: false, patient: null, appointments: [] });
        setError("Unable to load the selected patient details.");
      });

    return () => {
      active = false;
    };
  }, [routePatientId]);

  useEffect(() => {
    if (!patientForm.id) {
      return;
    }

    patientIntakeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.requestAnimationFrame(() => {
      patientNameInputRef.current?.focus();
      patientNameInputRef.current?.select();
    });
  }, [patientForm.id]);

  async function handleSubmit(event, method, path, payload, reset) {
    event.preventDefault();

    try {
      await api[method](path, payload);
      reset();
      await loadData();
    } catch (requestError) {
      setError("Unable to save your changes. Please verify the form values and API status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await api.delete(deleteTarget.path);
      setDeleteTarget(null);
      await loadData();
    } catch (requestError) {
      setError("Delete failed. Please try again after the API is available.");
    }
  }

  function queueDelete(rowType, row, path, label) {
    setDeleteTarget({ rowType, row, path, label });
  }

  function resetPatientForm() {
    setPatientForm(emptyPatient);
  }

  function resetDoctorForm() {
    setDoctorForm(emptyDoctor);
  }

  function resetAppointmentForm() {
    setAppointmentForm(emptyAppointment);
  }

  function startPatientEdit(patient) {
    setPatientForm({
      ...patient,
      age: patient.age ?? "",
      lastVisit: toDateInputValue(patient.lastVisit)
    });
  }

  function startDoctorEdit(doctor) {
    setDoctorForm({ ...doctor });
  }

  function startAppointmentEdit(appointment) {
    setAppointmentForm({
      ...appointment,
      appointmentDate: toDateTimeInputValue(appointment.appointmentDate)
    });
  }

  function syncAppointmentSelection(field, value) {
    const selectedPatient = patientOptions.find((patient) => patient.id === (field === "patientId" ? value : appointmentForm.patientId));
    const selectedDoctor = doctorOptions.find((doctor) => doctor.id === (field === "doctorId" ? value : appointmentForm.doctorId));

    setAppointmentForm((current) => ({
      ...current,
      [field]: value,
      patientName:
        field === "patientId"
          ? selectedPatient?.fullName || ""
          : selectedPatient?.fullName || current.patientName,
      doctorName:
        field === "doctorId"
          ? selectedDoctor?.fullName || ""
          : selectedDoctor?.fullName || current.doctorName
    }));
  }

  function updateTableState(setter, patch) {
    setter((current) => ({ ...current, ...patch }));
  }

  if (routePatientId) {
    return <PatientDetailView detail={patientDetail} onBack={goToDashboard} />;
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Run consultations, schedules, and patient records from one calm workspace.</p>
          <h2>Welcome to Dr. Tuba&apos;s Homoeocure clinic</h2>
        </div>
        <button className="secondary-button" onClick={loadData}>
          Refresh Data
        </button>
      </section>

      {error ? <div className="alert">{error}</div> : null}
      {loading ? <div className="alert">Loading clinic data...</div> : null}

      <section className="metric-grid">
        <MetricCard label="Registered Patients" value={dashboard.totalPatients} />
        <MetricCard label="Available Doctors" value={dashboard.totalDoctors} />
        <MetricCard label="Appointments Logged" value={dashboard.totalAppointments} />
        <MetricCard label="Upcoming Visits" value={dashboard.upcomingAppointments} />
      </section>

      <section className="content-grid">
        <SectionCard title="Patient Intake" subtitle="Create or update a patient profile with symptoms and history.">
          <form
            ref={patientIntakeRef}
            className="form-grid"
            onSubmit={(event) =>
              handleSubmit(
                event,
                patientForm.id ? "put" : "post",
                patientForm.id ? `/api/patients/${patientForm.id}` : "/api/patients",
                {
                  fullName: patientForm.fullName,
                  age: Number(patientForm.age),
                  gender: patientForm.gender,
                  phone: patientForm.phone,
                  email: patientForm.email,
                  address: patientForm.address,
                  chiefComplaint: patientForm.chiefComplaint,
                  medicalHistory: patientForm.medicalHistory,
                  lastVisit: patientForm.lastVisit || null
                },
                resetPatientForm
              )
            }
          >
            <input
              ref={patientNameInputRef}
              placeholder="Full name"
              value={patientForm.fullName}
              onChange={(event) => setPatientForm({ ...patientForm, fullName: event.target.value })}
              required
            />
            <input type="number" min="0" placeholder="Age" value={patientForm.age} onChange={(event) => setPatientForm({ ...patientForm, age: event.target.value })} required />
            <select value={patientForm.gender} onChange={(event) => setPatientForm({ ...patientForm, gender: event.target.value })}>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
            <input placeholder="Phone" value={patientForm.phone} onChange={(event) => setPatientForm({ ...patientForm, phone: event.target.value })} required />
            <input placeholder="Email" value={patientForm.email} onChange={(event) => setPatientForm({ ...patientForm, email: event.target.value })} />
            <input type="date" value={patientForm.lastVisit} onChange={(event) => setPatientForm({ ...patientForm, lastVisit: event.target.value })} />
            <textarea placeholder="Address" value={patientForm.address} onChange={(event) => setPatientForm({ ...patientForm, address: event.target.value })} />
            <textarea placeholder="Chief complaint" value={patientForm.chiefComplaint} onChange={(event) => setPatientForm({ ...patientForm, chiefComplaint: event.target.value })} />
            <textarea placeholder="Medical history" value={patientForm.medicalHistory} onChange={(event) => setPatientForm({ ...patientForm, medicalHistory: event.target.value })} />
            <div className="form-actions">
              <button type="submit">{patientForm.id ? "Update Patient" : "Save Patient"}</button>
              {patientForm.id ? <button type="button" className="ghost-button" onClick={resetPatientForm}>Cancel Edit</button> : null}
            </div>
          </form>
        </SectionCard>

        {/* <SectionCard title="Doctor Registry" subtitle="Track consultant availability, room assignment, and contact info.">
          <form
            className="form-grid"
            onSubmit={(event) =>
              handleSubmit(
                event,
                doctorForm.id ? "put" : "post",
                doctorForm.id ? `/api/doctors/${doctorForm.id}` : "/api/doctors",
                {
                  fullName: doctorForm.fullName,
                  specialization: doctorForm.specialization,
                  availability: doctorForm.availability,
                  phone: doctorForm.phone,
                  room: doctorForm.room
                },
                resetDoctorForm
              )
            }
          >
            <input placeholder="Doctor name" value={doctorForm.fullName} onChange={(event) => setDoctorForm({ ...doctorForm, fullName: event.target.value })} required />
            <input placeholder="Specialization" value={doctorForm.specialization} onChange={(event) => setDoctorForm({ ...doctorForm, specialization: event.target.value })} required />
            <input placeholder="Availability" value={doctorForm.availability} onChange={(event) => setDoctorForm({ ...doctorForm, availability: event.target.value })} required />
            <input placeholder="Phone" value={doctorForm.phone} onChange={(event) => setDoctorForm({ ...doctorForm, phone: event.target.value })} />
            <input placeholder="Room" value={doctorForm.room} onChange={(event) => setDoctorForm({ ...doctorForm, room: event.target.value })} />
            <div className="form-actions">
              <button type="submit">{doctorForm.id ? "Update Doctor" : "Save Doctor"}</button>
              {doctorForm.id ? <button type="button" className="ghost-button" onClick={resetDoctorForm}>Cancel Edit</button> : null}
            </div>
          </form>
        </SectionCard> */}

        <SectionCard title="Schedule Consultation" subtitle="Link a patient to a doctor and add remedy planning notes.">
          <form
            className="form-grid"
            onSubmit={(event) =>
              handleSubmit(
                event,
                appointmentForm.id ? "put" : "post",
                appointmentForm.id ? `/api/appointments/${appointmentForm.id}` : "/api/appointments",
                {
                  patientId: appointmentForm.patientId,
                  patientName: appointmentForm.patientName,
                  doctorId: appointmentForm.doctorId,
                  doctorName: appointmentForm.doctorName,
                  appointmentDate: appointmentForm.appointmentDate,
                  status: appointmentForm.status,
                  notes: appointmentForm.notes,
                  remedyPlan: appointmentForm.remedyPlan
                },
                resetAppointmentForm
              )
            }
          >
            <select value={appointmentForm.patientId} onChange={(event) => syncAppointmentSelection("patientId", event.target.value)} required>
              <option value="">Select patient</option>
              {patientOptions.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.fullName}</option>
              ))}
            </select>
            <select value={appointmentForm.doctorId} onChange={(event) => syncAppointmentSelection("doctorId", event.target.value)} required>
              <option value="">Select doctor</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>
              ))}
            </select>
            <input type="datetime-local" value={appointmentForm.appointmentDate} onChange={(event) => setAppointmentForm({ ...appointmentForm, appointmentDate: event.target.value })} required />
            <select value={appointmentForm.status} onChange={(event) => setAppointmentForm({ ...appointmentForm, status: event.target.value })}>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <textarea placeholder="Case notes" value={appointmentForm.notes} onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} />
            <textarea placeholder="Remedy plan" value={appointmentForm.remedyPlan} onChange={(event) => setAppointmentForm({ ...appointmentForm, remedyPlan: event.target.value })} />
            <div className="form-actions">
              <button type="submit">{appointmentForm.id ? "Update Appointment" : "Book Appointment"}</button>
              {appointmentForm.id ? <button type="button" className="ghost-button" onClick={resetAppointmentForm}>Cancel Edit</button> : null}
            </div>
          </form>
        </SectionCard>
      </section>

      <section className="table-grid">
        <SectionCard title="Patient Records">
          <DataTable
            title="Patients"
            searchPlaceholder="Search patients"
            columns={[
              { key: "fullName", label: "Name", sortKey: "fullName", render: (value, row) => <PatientLink patientId={row.id} label={value} /> },
              { key: "phone", label: "Phone" },
              { key: "chiefComplaint", label: "Concern" },
              { key: "lastVisit", label: "Last Visit", sortKey: "lastVisit", render: (value) => formatDate(value) }
            ]}
            rows={patientTable.items}
            query={patientTable.query}
            page={patientTable.page}
            size={patientTable.size}
            sortBy={patientTable.sortBy}
            sortDirection={patientTable.sortDirection}
            totalItems={patientTable.totalItems}
            totalPages={patientTable.totalPages}
            loading={patientTable.loading}
            onSearchChange={(value) => updateTableState(setPatientTable, { query: value, page: 1 })}
            onPageChange={(value) => updateTableState(setPatientTable, { page: value })}
            onSizeChange={(value) => updateTableState(setPatientTable, { size: value, page: 1 })}
            onSortChange={(value, direction) => updateTableState(setPatientTable, { sortBy: value, sortDirection: direction, page: 1 })}
            onEdit={startPatientEdit}
            onDelete={(row) => queueDelete("patient", row, `/api/patients/${row.id}`, row.fullName)}
          />
        </SectionCard>

        {/* <SectionCard title="Doctor List">
          <DataTable
            title="Doctors"
            searchPlaceholder="Search doctors"
            columns={[
              { key: "fullName", label: "Doctor" },
              { key: "specialization", label: "Specialization" },
              { key: "availability", label: "Availability" },
              { key: "room", label: "Room" }
            ]}
            rows={doctorTable.items}
            query={doctorTable.query}
            page={doctorTable.page}
            size={doctorTable.size}
            totalItems={doctorTable.totalItems}
            totalPages={doctorTable.totalPages}
            loading={doctorTable.loading}
            onSearchChange={(value) => updateTableState(setDoctorTable, { query: value, page: 1 })}
            onPageChange={(value) => updateTableState(setDoctorTable, { page: value })}
            onSizeChange={(value) => updateTableState(setDoctorTable, { size: value, page: 1 })}
            onEdit={startDoctorEdit}
            onDelete={(row) => queueDelete("doctor", row, `/api/doctors/${row.id}`, row.fullName)}
          />
        </SectionCard> */}

        <SectionCard title="Appointment Log">
          <DataTable
            title="Appointments"
            searchPlaceholder="Search appointments"
            columns={[
              { key: "patientName", label: "Patient", sortKey: "patientName", render: (value, row) => <PatientLink patientId={row.patientId} label={value} /> },
              { key: "doctorName", label: "Doctor" },
              { key: "appointmentDate", label: "Date", sortKey: "appointmentDate", render: (value) => formatDateTime(value) },
              { key: "status", label: "Status" },
              { key: "notes", label: "Notes", render: (value) => <HoverText value={value} maxLength={24} /> },
              { key: "remedyPlan", label: "Remedy Plan", render: (value) => <HoverText value={value} maxLength={24} /> }
            ]}
            rows={appointmentTable.items}
            query={appointmentTable.query}
            page={appointmentTable.page}
            size={appointmentTable.size}
            sortBy={appointmentTable.sortBy}
            sortDirection={appointmentTable.sortDirection}
            totalItems={appointmentTable.totalItems}
            totalPages={appointmentTable.totalPages}
            loading={appointmentTable.loading}
            onSearchChange={(value) => updateTableState(setAppointmentTable, { query: value, page: 1 })}
            onPageChange={(value) => updateTableState(setAppointmentTable, { page: value })}
            onSizeChange={(value) => updateTableState(setAppointmentTable, { size: value, page: 1 })}
            onSortChange={(value, direction) => updateTableState(setAppointmentTable, { sortBy: value, sortDirection: direction, page: 1 })}
            onEdit={startAppointmentEdit}
            onDelete={(row) => queueDelete("appointment", row, `/api/appointments/${row.id}`, row.patientName)}
            showActions={false}
          />
        </SectionCard>
      </section>

      <ConfirmDialog item={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </main>
  );
}
