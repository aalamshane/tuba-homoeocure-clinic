package com.clinic.management.repository;

import com.clinic.management.model.Appointment;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByAppointmentDateAfterOrderByAppointmentDateAsc(LocalDateTime appointmentDate);

    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(String patientId);
}
