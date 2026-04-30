import ConfirmDialog from "../common/ConfirmDialog";
import HoverText from "../common/HoverText";
import SectionCard from "../SectionCard";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

export default function PatientDetailView({
  detail,
  paymentForm,
  onPaymentFormChange,
  onPaymentSubmit,
  onDeletePayment,
  deleteTarget,
  onCancelDelete,
  onConfirmDelete,
  onBack
}) {
  const { loading, patient, appointments, paymentSummary } = detail;

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
              <article className="detail-card"><span>Card No.</span><strong>{patient.cardNumber ?? "-"}</strong></article>
              <article className="detail-card"><span>Age</span><strong>{patient.age ?? "-"}</strong></article>
              <article className="detail-card"><span>Gender</span><strong>{patient.gender || "-"}</strong></article>
              <article className="detail-card"><span>Phone</span><strong>{patient.phone || "-"}</strong></article>
              <article className="detail-card"><span>Last Visit</span><strong>{formatDate(patient.lastVisit)}</strong></article>
            </div>
          </SectionCard>

          <SectionCard title="Payment Summary" subtitle="Track billed, paid, and pending amounts for this patient.">
            <div className="detail-card-grid payment-card-grid">
              <article className="detail-card"><span>Total Billed</span><strong>{formatCurrency(paymentSummary.totalBilled)}</strong></article>
              <article className="detail-card"><span>Paid Till Now</span><strong>{formatCurrency(paymentSummary.totalPaid)}</strong></article>
              <article className="detail-card"><span>Remaining</span><strong>{formatCurrency(paymentSummary.totalRemaining)}</strong></article>
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

          <SectionCard title="Add Payment Entry" subtitle="Record the visit amount, what has been paid, and what is still due.">
            <form className="form-grid" onSubmit={onPaymentSubmit}>
              <input
                placeholder="Description"
                value={paymentForm.description}
                onChange={(event) => onPaymentFormChange("description", event.target.value)}
                required
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Total amount"
                value={paymentForm.totalAmount}
                onChange={(event) => onPaymentFormChange("totalAmount", event.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount paid"
                value={paymentForm.amountPaid}
                onChange={(event) => onPaymentFormChange("amountPaid", event.target.value)}
                required
              />
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(event) => onPaymentFormChange("paymentDate", event.target.value)}
                required
              />
              <select value={paymentForm.paymentMethod} onChange={(event) => onPaymentFormChange("paymentMethod", event.target.value)}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
              <textarea
                placeholder="Payment notes"
                value={paymentForm.notes}
                onChange={(event) => onPaymentFormChange("notes", event.target.value)}
              />
              <div className="form-actions">
                <button type="submit">Save Payment</button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Payment History" subtitle="Every recorded payment entry for this patient.">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Method</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSummary.payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-state">
                        No payment records found for this patient yet.
                      </td>
                    </tr>
                  ) : (
                    paymentSummary.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td>{payment.description || "Consultation payment"}</td>
                        <td>{formatCurrency(payment.totalAmount)}</td>
                        <td>{formatCurrency(payment.amountPaid)}</td>
                        <td>{formatCurrency(payment.totalAmount - payment.amountPaid)}</td>
                        <td>{payment.paymentMethod}</td>
                        <td><HoverText value={payment.notes || "-"} maxLength={32} /></td>
                        <td className="action-cell">
                          <button type="button" className="danger-button" onClick={() => onDeletePayment(payment)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </section>
      ) : null}

      <ConfirmDialog item={deleteTarget} onCancel={onCancelDelete} onConfirm={onConfirmDelete} />
    </main>
  );
}
