package com.motofix.repository;

import com.motofix.entity.Appointment;
import com.motofix.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStatusOrderByScheduledAtAsc(AppointmentStatus status);

    List<Appointment> findByScheduledAtBetweenOrderByScheduledAtAsc(LocalDateTime start, LocalDateTime end);

    boolean existsByMotorcycleIdAndScheduledAt(Long motorcycleId, LocalDateTime scheduledAt);
}
