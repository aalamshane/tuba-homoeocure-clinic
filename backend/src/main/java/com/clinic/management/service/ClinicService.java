package com.clinic.management.service;

import com.clinic.management.dto.PageResponse;
import com.clinic.management.dto.PatientPaymentSummaryResponse;
import com.clinic.management.model.Appointment;
import com.clinic.management.model.Doctor;
import com.clinic.management.model.Payment;
import com.clinic.management.model.Patient;
import com.clinic.management.repository.AppointmentRepository;
import com.clinic.management.repository.DoctorRepository;
import com.clinic.management.repository.PaymentRepository;
import com.clinic.management.repository.PatientRepository;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClinicService {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final MongoTemplate mongoTemplate;

    public ClinicService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            PaymentRepository paymentRepository,
            MongoTemplate mongoTemplate) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.paymentRepository = paymentRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void initializePatientCardNumbers() {
        mongoTemplate.indexOps(Patient.class)
                .ensureIndex(new Index().on("cardNumber", Sort.Direction.ASC).unique().named("idx_patients_cardNumber"));
        mongoTemplate.indexOps(Payment.class)
                .ensureIndex(new Index().on("patientId", Sort.Direction.ASC).named("idx_payments_patientId"));
    }

    public List<Patient> getPatients() {
        return patientRepository.findAll();
    }

    public PageResponse<Patient> getPatients(String search, int page, int size, String sortBy, String sortDirection) {
        Query query = buildPatientQuery(search);
        long totalItems = mongoTemplate.count(query, Patient.class);
        query.with(buildPatientSort(sortBy, sortDirection));
        query.skip((long) (page - 1) * size);
        query.limit(size);
        return new PageResponse<>(mongoTemplate.find(query, Patient.class), totalItems, page, size);
    }

    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(String id, Patient patient) {
        patient.setId(id);
        Patient savedPatient = patientRepository.save(patient);

        List<Payment> payments = paymentRepository.findByPatientIdOrderByPaymentDateDesc(id);
        for (Payment payment : payments) {
            if (!savedPatient.getFullName().equals(payment.getPatientName())) {
                payment.setPatientName(savedPatient.getFullName());
                paymentRepository.save(payment);
            }
        }

        return savedPatient;
    }

    public void deletePatient(String id) {
        appointmentRepository.deleteByPatientId(id);
        paymentRepository.deleteByPatientId(id);
        patientRepository.deleteById(id);
    }

    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    public PageResponse<Doctor> getDoctors(String search, int page, int size) {
        Query query = buildDoctorQuery(search);
        long totalItems = mongoTemplate.count(query, Doctor.class);
        query.with(Sort.by(Sort.Direction.ASC, "fullName"));
        query.skip((long) (page - 1) * size);
        query.limit(size);
        return new PageResponse<>(mongoTemplate.find(query, Doctor.class), totalItems, page, size);
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(String id, Doctor doctor) {
        doctor.setId(id);
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(String id) {
        doctorRepository.deleteById(id);
    }

    public List<Appointment> getAppointments() {
        return appointmentRepository.findAll();
    }

    public PageResponse<Appointment> getAppointments(String search, int page, int size, String sortBy, String sortDirection) {
        Query query = buildAppointmentQuery(search);
        long totalItems = mongoTemplate.count(query, Appointment.class);
        query.with(buildAppointmentSort(sortBy, sortDirection));
        query.skip((long) (page - 1) * size);
        query.limit(size);
        return new PageResponse<>(mongoTemplate.find(query, Appointment.class), totalItems, page, size);
    }

    public List<Appointment> getAppointmentsForPatient(String patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    public List<Appointment> getUpcomingAppointments() {
        return appointmentRepository.findByAppointmentDateAfterOrderByAppointmentDateAsc(LocalDateTime.now());
    }

    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(String id, Appointment appointment) {
        appointment.setId(id);
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(String id) {
        appointmentRepository.deleteById(id);
    }

    public PatientPaymentSummaryResponse getPaymentSummaryForPatient(String patientId) {
        getPatientById(patientId);
        List<Payment> payments = paymentRepository.findByPatientIdOrderByPaymentDateDesc(patientId);
        double totalBilled = payments.stream().mapToDouble(Payment::getTotalAmount).sum();
        double totalPaid = payments.stream().mapToDouble(Payment::getAmountPaid).sum();
        return new PatientPaymentSummaryResponse(payments, totalBilled, totalPaid);
    }

    public Payment savePayment(String patientId, Payment payment) {
        Patient patient = getPatientById(patientId);
        validatePaymentAmounts(payment);
        payment.setPatientId(patientId);
        payment.setPatientName(patient.getFullName());
        return paymentRepository.save(payment);
    }

    public void deletePayment(String patientId, String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!patientId.equals(payment.getPatientId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment does not belong to the selected patient");
        }

        paymentRepository.deleteById(paymentId);
    }

    private Query buildPatientQuery(String search) {
        Query query = new Query();

        if (StringUtils.hasText(search)) {
            String regex = ".*" + java.util.regex.Pattern.quote(search.trim()) + ".*";
            List<Criteria> searchCriteria = new ArrayList<>(List.of(
                    Criteria.where("fullName").regex(regex, "i"),
                    Criteria.where("phone").regex(regex, "i"),
                    Criteria.where("chiefComplaint").regex(regex, "i"),
                    Criteria.where("email").regex(regex, "i"),
                    Criteria.where("address").regex(regex, "i")));

            if (search.trim().matches("\\d+")) {
                searchCriteria.add(Criteria.where("cardNumber").is(Integer.parseInt(search.trim())));
            }

            query.addCriteria(new Criteria().orOperator(searchCriteria.toArray(new Criteria[0])));
        }

        return query;
    }

    private Query buildDoctorQuery(String search) {
        Query query = new Query();

        if (StringUtils.hasText(search)) {
            String regex = ".*" + java.util.regex.Pattern.quote(search.trim()) + ".*";
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("fullName").regex(regex, "i"),
                    Criteria.where("specialization").regex(regex, "i"),
                    Criteria.where("availability").regex(regex, "i"),
                    Criteria.where("room").regex(regex, "i"),
                    Criteria.where("phone").regex(regex, "i")));
        }

        return query;
    }

    private Query buildAppointmentQuery(String search) {
        Query query = new Query();

        if (StringUtils.hasText(search)) {
            String regex = ".*" + java.util.regex.Pattern.quote(search.trim()) + ".*";
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("patientName").regex(regex, "i"),
                    Criteria.where("doctorName").regex(regex, "i"),
                    Criteria.where("status").regex(regex, "i"),
                    Criteria.where("notes").regex(regex, "i"),
                    Criteria.where("remedyPlan").regex(regex, "i")));
        }

        return query;
    }

    private Sort buildPatientSort(String sortBy, String sortDirection) {
        Sort.Direction direction = resolveDirection(sortDirection, Sort.Direction.ASC);

        return switch (sortBy) {
            case "cardNumber" -> Sort.by(direction, "cardNumber").and(Sort.by(Sort.Direction.ASC, "fullName"));
            case "lastVisit" -> Sort.by(direction, "lastVisit").and(Sort.by(Sort.Direction.ASC, "fullName"));
            case "fullName" -> Sort.by(direction, "fullName");
            default -> Sort.by(Sort.Direction.ASC, "fullName");
        };
    }

    private Sort buildAppointmentSort(String sortBy, String sortDirection) {
        Sort.Direction direction = resolveDirection(sortDirection, Sort.Direction.DESC);

        return switch (sortBy) {
            case "patientName" -> Sort.by(direction, "patientName").and(Sort.by(Sort.Direction.DESC, "appointmentDate"));
            case "appointmentDate" -> Sort.by(direction, "appointmentDate").and(Sort.by(Sort.Direction.ASC, "patientName"));
            default -> Sort.by(Sort.Direction.DESC, "appointmentDate");
        };
    }

    private Sort.Direction resolveDirection(String sortDirection, Sort.Direction fallback) {
        if (!StringUtils.hasText(sortDirection)) {
            return fallback;
        }

        return "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private void validatePaymentAmounts(Payment payment) {
        if (payment.getAmountPaid() > payment.getTotalAmount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid amount cannot exceed total amount");
        }
    }
}
