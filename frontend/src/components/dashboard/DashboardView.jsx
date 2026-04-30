import ConfirmDialog from "../common/ConfirmDialog";
import DataTable from "../common/DataTable";
import HoverText from "../common/HoverText";
import MetricCard from "../common/MetricCard";
import PatientLink from "../patients/PatientLink";
import SearchablePatientSelect from "../patients/SearchablePatientSelect";
import SectionCard from "../SectionCard";
import { formatDate, formatDateTime } from "../../utils/formatters";

export default function DashboardView({
  dashboard,
  loading,
  error,
  patientTable,
  appointmentTable,
  patientOptions,
  doctorOptions,
  patientForm,
  appointmentForm,
  deleteTarget,
  patientIntakeRef,
  patientNameInputRef,
  onRefresh,
  onPatientFormChange,
  onPatientSubmit,
  onPatientReset,
  onAppointmentFormChange,
  onAppointmentPatientChange,
  onAppointmentDoctorChange,
  onAppointmentSubmit,
  onAppointmentReset,
  onPatientTableChange,
  onAppointmentTableChange,
  onPatientEdit,
  onQueueDelete,
  onCancelDelete,
  onConfirmDelete
}) {
  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Run consultations, schedules, and patient records from one calm workspace.</p>
          <h2>Welcome to Dr. Tuba&apos;s Homoeocure clinic</h2>
        </div>
        <button className="secondary-button" onClick={onRefresh}>
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
          <form ref={patientIntakeRef} className="form-grid" onSubmit={onPatientSubmit}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={patientForm.cardNumber}
              placeholder="Card Number"
              onChange={(event) => onPatientFormChange("cardNumber", event.target.value.replace(/\D/g, ""))}
              aria-label="Card Number"
              required
            />
            <input
              ref={patientNameInputRef}
              placeholder="Full name"
              value={patientForm.fullName}
              onChange={(event) => onPatientFormChange("fullName", event.target.value)}
              required
            />
            <input
              type="number"
              min="0"
              placeholder="Age"
              value={patientForm.age}
              onChange={(event) => onPatientFormChange("age", event.target.value)}
              required
            />
            <select value={patientForm.gender} onChange={(event) => onPatientFormChange("gender", event.target.value)}>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
            <input
              placeholder="Phone"
              value={patientForm.phone}
              onChange={(event) => onPatientFormChange("phone", event.target.value)}
              required
            />
            <input placeholder="Email" value={patientForm.email} onChange={(event) => onPatientFormChange("email", event.target.value)} />
            <input type="date" value={patientForm.lastVisit} onChange={(event) => onPatientFormChange("lastVisit", event.target.value)} />
            <textarea placeholder="Address" value={patientForm.address} onChange={(event) => onPatientFormChange("address", event.target.value)} />
            <textarea
              placeholder="Chief complaint"
              value={patientForm.chiefComplaint}
              onChange={(event) => onPatientFormChange("chiefComplaint", event.target.value)}
            />
            <textarea
              placeholder="Medical history"
              value={patientForm.medicalHistory}
              onChange={(event) => onPatientFormChange("medicalHistory", event.target.value)}
            />
            <div className="form-actions">
              <button type="submit">{patientForm.id ? "Update Patient" : "Save Patient"}</button>
              {patientForm.id ? <button type="button" className="ghost-button" onClick={onPatientReset}>Cancel Edit</button> : null}
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Schedule Consultation" subtitle="Link a patient to a doctor and add remedy planning notes.">
          <form className="form-grid" onSubmit={onAppointmentSubmit}>
            <SearchablePatientSelect
              value={appointmentForm.patientId}
              patientOptions={patientOptions}
              onChange={onAppointmentPatientChange}
              required
            />
            <select value={appointmentForm.doctorId} onChange={(event) => onAppointmentDoctorChange(event.target.value)} required>
              <option value="">Select doctor</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={appointmentForm.appointmentDate}
              onChange={(event) => onAppointmentFormChange("appointmentDate", event.target.value)}
              required
            />
            <select value={appointmentForm.status} onChange={(event) => onAppointmentFormChange("status", event.target.value)}>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <textarea placeholder="Case notes" value={appointmentForm.notes} onChange={(event) => onAppointmentFormChange("notes", event.target.value)} />
            <textarea
              placeholder="Remedy plan"
              value={appointmentForm.remedyPlan}
              onChange={(event) => onAppointmentFormChange("remedyPlan", event.target.value)}
            />
            <div className="form-actions">
              <button type="submit">{appointmentForm.id ? "Update Appointment" : "Book Appointment"}</button>
              {appointmentForm.id ? <button type="button" className="ghost-button" onClick={onAppointmentReset}>Cancel Edit</button> : null}
            </div>
          </form>
        </SectionCard>
      </section>

      <section className="table-grid">
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
            onSearchChange={(value) => onAppointmentTableChange({ query: value, page: 1 })}
            onPageChange={(value) => onAppointmentTableChange({ page: value })}
            onSizeChange={(value) => onAppointmentTableChange({ size: value, page: 1 })}
            onSortChange={(value, direction) => onAppointmentTableChange({ sortBy: value, sortDirection: direction, page: 1 })}
            showActions={false}
          />
        </SectionCard>

        <SectionCard title="Patient Records">
          <DataTable
            title="Patients"
            searchPlaceholder="Search patients"
            columns={[
              { key: "cardNumber", label: "Card No.", sortKey: "cardNumber" },
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
            onSearchChange={(value) => onPatientTableChange({ query: value, page: 1 })}
            onPageChange={(value) => onPatientTableChange({ page: value })}
            onSizeChange={(value) => onPatientTableChange({ size: value, page: 1 })}
            onSortChange={(value, direction) => onPatientTableChange({ sortBy: value, sortDirection: direction, page: 1 })}
            onEdit={onPatientEdit}
            onDelete={(row) => onQueueDelete("patient", row, `/api/patients/${row.id}`, row.fullName)}
          />
        </SectionCard>
      </section>

      <ConfirmDialog item={deleteTarget} onCancel={onCancelDelete} onConfirm={onConfirmDelete} />
    </main>
  );
}
