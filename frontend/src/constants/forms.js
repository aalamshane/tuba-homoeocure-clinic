export const defaultTableState = {
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

export const emptyPatient = {
  cardNumber: "",
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

export const emptyAppointment = {
  patientId: "",
  patientName: "",
  doctorId: "",
  doctorName: "",
  appointmentDate: "",
  status: "Scheduled",
  notes: "",
  remedyPlan: ""
};

export function createEmptyPaymentForm() {
  return {
    description: "",
    totalAmount: "",
    amountPaid: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Cash",
    notes: ""
  };
}

export const emptyPaymentSummary = {
  payments: [],
  totalBilled: 0,
  totalPaid: 0,
  totalRemaining: 0
};
