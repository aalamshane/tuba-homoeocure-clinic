package com.clinic.management.dto;

import com.clinic.management.model.Payment;
import java.util.List;

public class PatientPaymentSummaryResponse {

    private List<Payment> payments;
    private double totalBilled;
    private double totalPaid;
    private double totalRemaining;

    public PatientPaymentSummaryResponse(List<Payment> payments, double totalBilled, double totalPaid) {
        this.payments = payments;
        this.totalBilled = totalBilled;
        this.totalPaid = totalPaid;
        this.totalRemaining = Math.max(0, totalBilled - totalPaid);
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public double getTotalBilled() {
        return totalBilled;
    }

    public void setTotalBilled(double totalBilled) {
        this.totalBilled = totalBilled;
    }

    public double getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(double totalPaid) {
        this.totalPaid = totalPaid;
    }

    public double getTotalRemaining() {
        return totalRemaining;
    }

    public void setTotalRemaining(double totalRemaining) {
        this.totalRemaining = totalRemaining;
    }
}
