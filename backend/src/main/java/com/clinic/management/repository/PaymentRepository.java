package com.clinic.management.repository;

import com.clinic.management.model.Payment;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByPatientIdOrderByPaymentDateDesc(String patientId);

    void deleteByPatientId(String patientId);
}
