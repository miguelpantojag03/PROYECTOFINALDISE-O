package com.motofix.service;

import com.motofix.dto.AppointmentRequest;
import com.motofix.dto.AppointmentResponse;
import com.motofix.model.AppointmentStatus;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse create(AppointmentRequest request);

    List<AppointmentResponse> findAll();

    List<AppointmentResponse> findUpcoming();

    AppointmentResponse changeStatus(Long id, AppointmentStatus status);

    void delete(Long id);
}
