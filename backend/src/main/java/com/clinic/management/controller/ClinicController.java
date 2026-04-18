package com.clinic.management.controller;

import com.clinic.management.dto.PageResponse;
import com.clinic.management.model.Appointment;
import com.clinic.management.model.Doctor;
import com.clinic.management.model.Patient;
import com.clinic.management.service.ClinicService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"})
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        List<Appointment> upcomingAppointments = clinicService.getUpcomingAppointments();
        return Map.of(
                "totalPatients", clinicService.getPatients().size(),
                "totalDoctors", clinicService.getDoctors().size(),
                "totalAppointments", clinicService.getAppointments().size(),
                "upcomingAppointments", upcomingAppointments.size(),
                "nextAppointments", upcomingAppointments.stream().limit(5).toList());
    }

    @GetMapping("/patients")
    public PageResponse<Patient> getPatients(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        return clinicService.getPatients(q, Math.max(page, 1), sanitizePageSize(size), sortBy, sortDirection);
    }

    @GetMapping("/patients/{id}")
    public Patient getPatient(@PathVariable String id) {
        return clinicService.getPatientById(id);
    }

    @GetMapping("/patients/{id}/appointments")
    public List<Appointment> getPatientAppointments(@PathVariable String id) {
        return clinicService.getAppointmentsForPatient(id);
    }

    @PostMapping("/patients")
    public Patient createPatient(@Valid @RequestBody Patient patient) {
        return clinicService.savePatient(patient);
    }

    @PutMapping("/patients/{id}")
    public Patient updatePatient(@PathVariable String id, @Valid @RequestBody Patient patient) {
        return clinicService.updatePatient(id, patient);
    }

    @DeleteMapping("/patients/{id}")
    public void deletePatient(@PathVariable String id) {
        clinicService.deletePatient(id);
    }

    @GetMapping("/doctors")
    public PageResponse<Doctor> getDoctors(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size) {
        return clinicService.getDoctors(q, Math.max(page, 1), sanitizePageSize(size));
    }

    @PostMapping("/doctors")
    public Doctor createDoctor(@Valid @RequestBody Doctor doctor) {
        return clinicService.saveDoctor(doctor);
    }

    @PutMapping("/doctors/{id}")
    public Doctor updateDoctor(@PathVariable String id, @Valid @RequestBody Doctor doctor) {
        return clinicService.updateDoctor(id, doctor);
    }

    @DeleteMapping("/doctors/{id}")
    public void deleteDoctor(@PathVariable String id) {
        clinicService.deleteDoctor(id);
    }

    @GetMapping("/appointments")
    public PageResponse<Appointment> getAppointments(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "appointmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return clinicService.getAppointments(q, Math.max(page, 1), sanitizePageSize(size), sortBy, sortDirection);
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@Valid @RequestBody Appointment appointment) {
        return clinicService.saveAppointment(appointment);
    }

    @PutMapping("/appointments/{id}")
    public Appointment updateAppointment(@PathVariable String id, @Valid @RequestBody Appointment appointment) {
        return clinicService.updateAppointment(id, appointment);
    }

    @DeleteMapping("/appointments/{id}")
    public void deleteAppointment(@PathVariable String id) {
        clinicService.deleteAppointment(id);
    }

    private int sanitizePageSize(int size) {
        if (size <= 5) {
            return 5;
        }
        if (size <= 10) {
            return 10;
        }
        return 15;
    }
}
