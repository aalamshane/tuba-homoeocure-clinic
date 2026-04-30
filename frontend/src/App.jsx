import { useEffect, useRef, useState } from "react";
import { api, requestTable } from "./api/clinicApi";
import DashboardView from "./components/dashboard/DashboardView";
import PatientDetailView from "./components/patients/PatientDetailView";
import {
  createEmptyPaymentForm,
  defaultTableState,
  emptyAppointment,
  emptyPatient,
  emptyPaymentSummary
} from "./constants/forms";
import { formatDate, toDateInputValue } from "./utils/formatters";
import { getPatientRouteId, goToDashboard } from "./utils/routes";

function createEmptyPatientDetail() {
  return {
    loading: false,
    patient: null,
    appointments: [],
    paymentSummary: emptyPaymentSummary
  };
}

export default function App() {
  const patientIntakeRef = useRef(null);
  const patientNameInputRef = useRef(null);
  const [routePatientId, setRoutePatientId] = useState(getPatientRouteId());
  const [patientDetail, setPatientDetail] = useState(createEmptyPatientDetail);
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
  const [maxPatientCardNumber, setMaxPatientCardNumber] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [paymentForm, setPaymentForm] = useState(createEmptyPaymentForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [patientIntakeOpen, setPatientIntakeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleHashChange = () => setRoutePatientId(getPatientRouteId());
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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

  async function loadMaxPatientCardNumber() {
    const patientData = await api.get("/api/patients?page=1&size=5&sortBy=cardNumber&sortDirection=desc");
    setMaxPatientCardNumber(patientData.items[0]?.cardNumber ?? null);
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
        loadOptions(),
        loadMaxPatientCardNumber()
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
      setPatientDetail(createEmptyPatientDetail());
      setPaymentForm(createEmptyPaymentForm());
      return;
    }

    let active = true;
    setPatientDetail({
      loading: true,
      patient: null,
      appointments: [],
      paymentSummary: emptyPaymentSummary
    });

    Promise.all([
      api.get(`/api/patients/${routePatientId}`),
      api.get(`/api/patients/${routePatientId}/appointments`),
      api.get(`/api/patients/${routePatientId}/payments`)
    ])
      .then(([patient, appointments, paymentSummary]) => {
        if (!active) {
          return;
        }
        setPatientDetail({ loading: false, patient, appointments, paymentSummary });
        setPaymentForm(createEmptyPaymentForm());
        setError("");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setPatientDetail(createEmptyPatientDetail());
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

    setPatientIntakeOpen(true);
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
      return true;
    } catch (requestError) {
      setError("Unable to save your changes. Please verify the form values and API status.");
      return false;
    }
  }

  function queueDelete(rowType, row, path, label) {
    setDeleteTarget({ type: rowType, row, path, label });
  }

  function resetPatientForm() {
    setPatientForm(emptyPatient);
  }

  function openPatientIntake() {
    setPatientForm(emptyPatient);
    setPatientIntakeOpen(true);
    window.requestAnimationFrame(() => {
      patientNameInputRef.current?.focus();
    });
  }

  function closePatientIntake() {
    setPatientIntakeOpen(false);
    resetPatientForm();
  }

  function resetAppointmentForm() {
    setAppointmentForm(emptyAppointment);
  }

  function updatePatientForm(field, value) {
    setPatientForm((current) => ({ ...current, [field]: value }));
  }

  function updateAppointmentForm(field, value) {
    setAppointmentForm((current) => ({ ...current, [field]: value }));
  }

  function updatePaymentForm(field, value) {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  }

  function updateTableState(setter, patch) {
    setter((current) => ({ ...current, ...patch }));
  }

  function startPatientEdit(patient) {
    setPatientForm({
      ...patient,
      cardNumber: patient.cardNumber ? String(patient.cardNumber) : "",
      age: patient.age ?? "",
      lastVisit: toDateInputValue(patient.lastVisit)
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

  async function handlePatientSubmit(event) {
    const saved = await handleSubmit(
      event,
      patientForm.id ? "put" : "post",
      patientForm.id ? `/api/patients/${patientForm.id}` : "/api/patients",
      {
        cardNumber: Number(patientForm.cardNumber),
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
    );

    if (saved) {
      setPatientIntakeOpen(false);
    }
  }

  async function handleAppointmentSubmit(event) {
    await handleSubmit(
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
    );
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!routePatientId) {
      return;
    }

    try {
      await api.post(`/api/patients/${routePatientId}/payments`, {
        description: paymentForm.description,
        totalAmount: Number(paymentForm.totalAmount),
        amountPaid: Number(paymentForm.amountPaid),
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });

      const paymentSummary = await api.get(`/api/patients/${routePatientId}/payments`);
      setPatientDetail((current) => ({ ...current, paymentSummary }));
      setPaymentForm(createEmptyPaymentForm());
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to save the payment entry.");
    }
  }

  function handleDeletePayment(payment) {
    setDeleteTarget({
      type: "payment",
      id: payment.id,
      label: payment.description || `payment on ${formatDate(payment.paymentDate)}`
    });
  }

  async function confirmDeleteTarget() {
    if (!deleteTarget) {
      return;
    }

    try {
      if (deleteTarget.type === "payment" && routePatientId) {
        await api.delete(`/api/patients/${routePatientId}/payments/${deleteTarget.id}`);
        const paymentSummary = await api.get(`/api/patients/${routePatientId}/payments`);
        setPatientDetail((current) => ({ ...current, paymentSummary }));
      } else {
        await api.delete(deleteTarget.path);
        await loadData();
      }

      setDeleteTarget(null);
      setError("");
    } catch (requestError) {
      setError(deleteTarget.type === "payment" ? "Unable to delete the payment entry." : "Delete failed. Please try again after the API is available.");
    }
  }

  if (routePatientId) {
    return (
      <PatientDetailView
        detail={patientDetail}
        paymentForm={paymentForm}
        onPaymentFormChange={updatePaymentForm}
        onPaymentSubmit={handlePaymentSubmit}
        onDeletePayment={handleDeletePayment}
        deleteTarget={deleteTarget}
        onCancelDelete={() => setDeleteTarget(null)}
        onConfirmDelete={confirmDeleteTarget}
        onBack={goToDashboard}
      />
    );
  }

  return (
    <DashboardView
      dashboard={dashboard}
      loading={loading}
      error={error}
      patientTable={patientTable}
      appointmentTable={appointmentTable}
      patientOptions={patientOptions}
      doctorOptions={doctorOptions}
      maxPatientCardNumber={maxPatientCardNumber}
      patientForm={patientForm}
      patientIntakeOpen={patientIntakeOpen}
      appointmentForm={appointmentForm}
      deleteTarget={deleteTarget}
      patientIntakeRef={patientIntakeRef}
      patientNameInputRef={patientNameInputRef}
      onRefresh={loadData}
      onOpenPatientIntake={openPatientIntake}
      onClosePatientIntake={closePatientIntake}
      onPatientFormChange={updatePatientForm}
      onPatientSubmit={handlePatientSubmit}
      onAppointmentFormChange={updateAppointmentForm}
      onAppointmentPatientChange={(patientId) => syncAppointmentSelection("patientId", patientId)}
      onAppointmentDoctorChange={(doctorId) => syncAppointmentSelection("doctorId", doctorId)}
      onAppointmentSubmit={handleAppointmentSubmit}
      onAppointmentReset={resetAppointmentForm}
      onPatientTableChange={(patch) => updateTableState(setPatientTable, patch)}
      onAppointmentTableChange={(patch) => updateTableState(setAppointmentTable, patch)}
      onPatientEdit={startPatientEdit}
      onQueueDelete={queueDelete}
      onCancelDelete={() => setDeleteTarget(null)}
      onConfirmDelete={confirmDeleteTarget}
    />
  );
}
