package com.motofix.service;

import com.motofix.dto.MotorcycleRequest;
import com.motofix.dto.MotorcycleResponse;

import java.util.List;

public interface MotorcycleService {
    MotorcycleResponse create(MotorcycleRequest request);
    List<MotorcycleResponse> findAll();
    MotorcycleResponse findById(Long id);
    List<MotorcycleResponse> findByCustomer(Long customerId);
    MotorcycleResponse updateMileage(Long id, Integer mileage);
    void delete(Long id);
}
