package com.motofix.service.impl;

import com.motofix.dto.MotorcycleRequest;
import com.motofix.dto.MotorcycleResponse;
import com.motofix.entity.Customer;
import com.motofix.entity.Motorcycle;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.MotorcycleMapper;
import com.motofix.repository.CustomerRepository;
import com.motofix.repository.MotorcycleRepository;
import com.motofix.service.AuditLogService;
import com.motofix.service.MotorcycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MotorcycleServiceImpl implements MotorcycleService {
    private final MotorcycleRepository motorcycleRepository;
    private final CustomerRepository customerRepository;
    private final MotorcycleMapper motorcycleMapper;
    private final AuditLogService auditLogService;

    @Override
    public MotorcycleResponse create(MotorcycleRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Motorcycle motorcycle = Motorcycle.builder()
                .brand(request.brand())
                .model(request.model())
                .year(request.year())
                .mileage(request.mileage())
                .plate(request.plate())
                .vin(request.vin())
                .customer(customer)
                .build();
        Motorcycle saved = motorcycleRepository.save(motorcycle);
        auditLogService.record("MOTORCYCLE_CREATED", "Motorcycle #" + saved.getId() + " created for customer #" + customer.getId());
        return motorcycleMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MotorcycleResponse> findAll() {
        return motorcycleRepository.findAll().stream().map(motorcycleMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MotorcycleResponse findById(Long id) {
        return motorcycleMapper.toResponse(getMotorcycle(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MotorcycleResponse> findByCustomer(Long customerId) {
        return motorcycleRepository.findByCustomerId(customerId).stream().map(motorcycleMapper::toResponse).toList();
    }

    @Override
    public MotorcycleResponse updateMileage(Long id, Integer mileage) {
        if (mileage == null || mileage < 0) {
            throw new BusinessException("Mileage must be zero or greater");
        }
        Motorcycle motorcycle = getMotorcycle(id);
        motorcycle.updateMileage(mileage);
        auditLogService.record("MOTORCYCLE_MILEAGE_UPDATED", "Motorcycle #" + id + " mileage updated to " + mileage);
        return motorcycleMapper.toResponse(motorcycle);
    }

    @Override
    public void delete(Long id) {
        motorcycleRepository.delete(getMotorcycle(id));
        auditLogService.record("MOTORCYCLE_DELETED", "Motorcycle #" + id + " deleted");
    }

    private Motorcycle getMotorcycle(Long id) {
        return motorcycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));
    }
}
