package com.motofix.controller;

import com.motofix.dto.ServiceMaintenanceRequest;
import com.motofix.dto.ServiceMaintenanceResponse;
import com.motofix.service.ServiceMaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-services")
@RequiredArgsConstructor
public class ServiceMaintenanceController {
    private final ServiceMaintenanceService serviceMaintenanceService;

    @PostMapping
    public ServiceMaintenanceResponse create(@Valid @RequestBody ServiceMaintenanceRequest request) {
        return serviceMaintenanceService.create(request);
    }

    @GetMapping
    public List<ServiceMaintenanceResponse> findAll() {
        return serviceMaintenanceService.findAll();
    }

    @GetMapping("/{id}")
    public ServiceMaintenanceResponse findById(@PathVariable Long id) {
        return serviceMaintenanceService.findById(id);
    }

    @PutMapping("/{id}")
    public ServiceMaintenanceResponse update(@PathVariable Long id, @Valid @RequestBody ServiceMaintenanceRequest request) {
        return serviceMaintenanceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        serviceMaintenanceService.delete(id);
    }
}
