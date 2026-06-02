package com.motofix.service.impl;

import com.motofix.dto.AppointmentRequest;
import com.motofix.dto.AppointmentResponse;
import com.motofix.entity.Appointment;
import com.motofix.entity.Customer;
import com.motofix.entity.Motorcycle;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.model.AppointmentStatus;
import com.motofix.repository.AppointmentRepository;
import com.motofix.repository.CustomerRepository;
import com.motofix.repository.MotorcycleRepository;
import com.motofix.service.AppointmentService;
import com.motofix.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final AuditLogService auditLogService;

    @Override
    public AppointmentResponse create(AppointmentRequest request) {
        if (request.scheduledAt().isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new BusinessException("Appointment cannot be scheduled in the past");
        }
        if (appointmentRepository.existsByMotorcycleIdAndScheduledAt(request.motorcycleId(), request.scheduledAt())) {
            throw new BusinessException("Motorcycle already has an appointment at this time");
        }
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Motorcycle motorcycle = motorcycleRepository.findById(request.motorcycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));
        Appointment appointment = Appointment.builder()
                .customer(customer)
                .motorcycle(motorcycle)
                .scheduledAt(request.scheduledAt())
                .status(AppointmentStatus.SCHEDULED)
                .reason(request.reason())
                .notes(request.notes())
                .createdAt(LocalDateTime.now())
                .build();
        Appointment saved = appointmentRepository.save(appointment);
        auditLogService.record("APPOINTMENT_CREATED", "Appointment #" + saved.getId() + " scheduled for customer #" + customer.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findUpcoming() {
        LocalDateTime now = LocalDateTime.now().minusHours(1);
        LocalDateTime nextWeek = LocalDateTime.now().plusDays(7);
        return appointmentRepository.findByScheduledAtBetweenOrderByScheduledAtAsc(now, nextWeek)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AppointmentResponse changeStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getAppointment(id);
        appointment.setStatus(status);
        auditLogService.record("APPOINTMENT_STATUS_CHANGED", "Appointment #" + id + " changed to " + status);
        return toResponse(appointment);
    }

    @Override
    public void delete(Long id) {
        appointmentRepository.delete(getAppointment(id));
        auditLogService.record("APPOINTMENT_DELETED", "Appointment #" + id + " deleted");
    }

    private Appointment getAppointment(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        Motorcycle motorcycle = appointment.getMotorcycle();
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getCustomer().getId(),
                appointment.getCustomer().getName(),
                motorcycle.getId(),
                motorcycle.getBrand() + " " + motorcycle.getModel() + " " + (motorcycle.getPlate() == null ? "" : motorcycle.getPlate()),
                appointment.getScheduledAt(),
                appointment.getStatus(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getCreatedAt()
        );
    }
}
