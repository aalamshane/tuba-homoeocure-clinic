const dbName = "homeopathy_clinic";
const clinicDb = db.getSiblingDB(dbName);

function createOrUpdateCollection(name, options) {
  const existing = clinicDb.getCollectionInfos({ name });

  if (existing.length === 0) {
    clinicDb.createCollection(name, options);
    print(`Created collection: ${name}`);
    return;
  }

  clinicDb.runCommand({
    collMod: name,
    ...options
  });
  print(`Updated collection: ${name}`);
}

createOrUpdateCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cardNumber", "fullName", "age", "gender", "phone"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        cardNumber: {
          bsonType: ["int", "long"],
          minimum: 1,
          description: "Patient card number must be a positive integer"
        },
        fullName: {
          bsonType: "string",
          minLength: 1,
          description: "Patient full name is required"
        },
        age: {
          bsonType: ["int", "long", "double", "decimal"],
          minimum: 0,
          description: "Age must be zero or greater"
        },
        gender: {
          bsonType: "string",
          enum: ["Female", "Male", "Other"],
          description: "Gender must match app options"
        },
        phone: {
          bsonType: "string",
          minLength: 1,
          description: "Phone is required"
        },
        email: { bsonType: ["string", "null"] },
        address: { bsonType: ["string", "null"] },
        chiefComplaint: { bsonType: ["string", "null"] },
        medicalHistory: { bsonType: ["string", "null"] },
        lastVisit: { bsonType: ["date", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

createOrUpdateCollection("doctors", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["fullName", "specialization", "availability"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        fullName: { bsonType: "string", minLength: 1 },
        specialization: { bsonType: "string", minLength: 1 },
        availability: { bsonType: "string", minLength: 1 },
        phone: { bsonType: ["string", "null"] },
        room: { bsonType: ["string", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

createOrUpdateCollection("appointments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "patientName", "doctorId", "doctorName", "appointmentDate", "status"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        patientId: {
          bsonType: "string",
          minLength: 1,
          description: "Stores Spring/Mongo document id as string"
        },
        patientName: { bsonType: "string", minLength: 1 },
        doctorId: { bsonType: "string", minLength: 1 },
        doctorName: { bsonType: "string", minLength: 1 },
        appointmentDate: {
          bsonType: "date",
          description: "Stored as ISODate by Spring Boot"
        },
        status: {
          bsonType: "string",
          enum: ["Scheduled", "Completed", "Cancelled"]
        },
        notes: { bsonType: ["string", "null"] },
        remedyPlan: { bsonType: ["string", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

createOrUpdateCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "patientName", "totalAmount", "amountPaid", "paymentDate", "paymentMethod"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        patientId: { bsonType: "string", minLength: 1 },
        patientName: { bsonType: "string", minLength: 1 },
        totalAmount: {
          bsonType: ["int", "long", "double", "decimal"],
          minimum: 0.01
        },
        amountPaid: {
          bsonType: ["int", "long", "double", "decimal"],
          minimum: 0
        },
        paymentDate: { bsonType: "date" },
        paymentMethod: { bsonType: "string", minLength: 1 },
        description: { bsonType: ["string", "null"] },
        notes: { bsonType: ["string", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

clinicDb.patients.createIndex({ phone: 1 }, { name: "idx_patients_phone" });
clinicDb.patients.createIndex({ cardNumber: 1 }, { name: "idx_patients_cardNumber", unique: true });
clinicDb.patients.createIndex({ fullName: 1 }, { name: "idx_patients_fullName" });
clinicDb.doctors.createIndex({ fullName: 1 }, { name: "idx_doctors_fullName" });
clinicDb.appointments.createIndex({ appointmentDate: 1 }, { name: "idx_appointments_appointmentDate" });
clinicDb.payments.createIndex({ patientId: 1, paymentDate: -1 }, { name: "idx_payments_patient_date" });
clinicDb.appointments.createIndex(
  { patientId: 1, doctorId: 1, appointmentDate: 1 },
  { name: "idx_appointments_patient_doctor_date" }
);

const patients = [
  {
    cardNumber: 1,
    fullName: "Ananya Sharma",
    age: 29,
    gender: "Female",
    phone: "+91-9876500001",
    email: "ananya.sharma@example.com",
    address: "12 Rose Garden, Pune",
    chiefComplaint: "Migraine and poor sleep",
    medicalHistory: "Frequent headaches for 2 years",
    lastVisit: new Date("2026-04-02T00:00:00Z")
  },
  {
    cardNumber: 2,
    fullName: "Rahul Verma",
    age: 41,
    gender: "Male",
    phone: "+91-9876500002",
    email: "rahul.verma@example.com",
    address: "44 Lake View Road, Mumbai",
    chiefComplaint: "Chronic acidity",
    medicalHistory: "Acidity episodes after meals",
    lastVisit: new Date("2026-04-08T00:00:00Z")
  },
  {
    cardNumber: 3,
    fullName: "Meera Iyer",
    age: 35,
    gender: "Female",
    phone: "+91-9876500003",
    email: "meera.iyer@example.com",
    address: "8 Temple Street, Chennai",
    chiefComplaint: "Skin allergy",
    medicalHistory: "Seasonal rashes and itching",
    lastVisit: new Date("2026-03-29T00:00:00Z")
  },
  {
    cardNumber: 4,
    fullName: "Arjun Patel",
    age: 52,
    gender: "Male",
    phone: "+91-9876500004",
    email: "arjun.patel@example.com",
    address: "19 Riverfront, Ahmedabad",
    chiefComplaint: "Joint pain",
    medicalHistory: "Knee stiffness in mornings",
    lastVisit: new Date("2026-04-10T00:00:00Z")
  },
  {
    cardNumber: 5,
    fullName: "Sara Khan",
    age: 24,
    gender: "Female",
    phone: "+91-9876500005",
    email: "sara.khan@example.com",
    address: "77 Green Park, Delhi",
    chiefComplaint: "Anxiety and fatigue",
    medicalHistory: "Stress-related tiredness during exams",
    lastVisit: new Date("2026-04-12T00:00:00Z")
  }
];

const doctors = [
  {
    fullName: "Dr. Tuba Pasha",
    specialization: "Classical Homeopathy",
    availability: "Mon-Fri, 10 AM - 6 PM",
    phone: "+91-8826936371",
    room: "A-101"
  }
];

clinicDb.appointments.deleteMany({});
clinicDb.payments.deleteMany({});
clinicDb.patients.deleteMany({});
clinicDb.doctors.deleteMany({});

const insertedPatients = clinicDb.patients.insertMany(patients).insertedIds;
const insertedDoctors = clinicDb.doctors.insertMany(doctors).insertedIds;

const patientIds = Object.values(insertedPatients).map((id) => id.toHexString());
const doctorIds = Object.values(insertedDoctors).map((id) => id.toHexString());

const appointments = [
  {
    patientId: patientIds[0],
    patientName: patients[0].fullName,
    doctorId: doctorIds[0],
    doctorName: doctors[0].fullName,
    appointmentDate: new Date("2026-04-18T04:30:00Z"),
    status: "Scheduled",
    notes: "Review migraine frequency and triggers",
    remedyPlan: "Initial constitutional assessment"
  },
  {
    patientId: patientIds[1],
    patientName: patients[1].fullName,
    doctorId: doctorIds[0],
    doctorName: doctors[0].fullName,
    appointmentDate: new Date("2026-04-18T07:00:00Z"),
    status: "Scheduled",
    notes: "Digestive symptom follow-up",
    remedyPlan: "Diet review and remedy adjustment"
  },
  {
    patientId: patientIds[2],
    patientName: patients[2].fullName,
    doctorId: doctorIds[0],
    doctorName: doctors[0].fullName,
    appointmentDate: new Date("2026-04-19T05:15:00Z"),
    status: "Scheduled",
    notes: "Check allergy improvement",
    remedyPlan: "Skin sensitivity monitoring"
  },
  {
    patientId: patientIds[3],
    patientName: patients[3].fullName,
    doctorId: doctorIds[0],
    doctorName: doctors[0].fullName,
    appointmentDate: new Date("2026-04-14T09:00:00Z"),
    status: "Completed",
    notes: "Pain reduced after previous course",
    remedyPlan: "Continue same medicine for 2 weeks"
  },
  {
    patientId: patientIds[4],
    patientName: patients[4].fullName,
    doctorId: doctorIds[0],
    doctorName: doctors[0].fullName,
    appointmentDate: new Date("2026-04-20T06:45:00Z"),
    status: "Scheduled",
    notes: "Stress and fatigue consultation",
    remedyPlan: "Sleep routine and remedy introduction"
  }
];

clinicDb.appointments.insertMany(appointments);

const payments = [
  {
    patientId: patientIds[0],
    patientName: patients[0].fullName,
    description: "Initial consultation and remedy kit",
    totalAmount: 1800,
    amountPaid: 1800,
    paymentDate: new Date("2026-04-02T00:00:00Z"),
    paymentMethod: "UPI",
    notes: "Fully settled during first visit"
  },
  {
    patientId: patientIds[1],
    patientName: patients[1].fullName,
    description: "Digestive follow-up package",
    totalAmount: 2200,
    amountPaid: 1200,
    paymentDate: new Date("2026-04-08T00:00:00Z"),
    paymentMethod: "Cash",
    notes: "Balance to be collected on next review"
  },
  {
    patientId: patientIds[2],
    patientName: patients[2].fullName,
    description: "Allergy treatment plan",
    totalAmount: 1500,
    amountPaid: 1500,
    paymentDate: new Date("2026-03-29T00:00:00Z"),
    paymentMethod: "Card",
    notes: "Paid in full"
  },
  {
    patientId: patientIds[3],
    patientName: patients[3].fullName,
    description: "Joint pain review and medicines",
    totalAmount: 2600,
    amountPaid: 2000,
    paymentDate: new Date("2026-04-14T00:00:00Z"),
    paymentMethod: "Bank Transfer",
    notes: "Remaining due next week"
  },
  {
    patientId: patientIds[4],
    patientName: patients[4].fullName,
    description: "Stress consultation",
    totalAmount: 1700,
    amountPaid: 700,
    paymentDate: new Date("2026-04-12T00:00:00Z"),
    paymentMethod: "Cash",
    notes: "Partial advance collected"
  }
];

clinicDb.payments.insertMany(payments);

print("");
print(`Initialized database: ${dbName}`);
print(`Seeded ${patients.length} patients`);
print(`Seeded ${doctors.length} doctors`);
print(`Seeded ${appointments.length} appointments`);
print(`Seeded ${payments.length} payments`);
