package com.motofix.controller;

import com.motofix.dto.MotorcycleRequest;
import com.motofix.dto.MotorcycleResponse;
import com.motofix.service.MotorcycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motorcycles")
@RequiredArgsConstructor
public class MotorcycleController {
    private final MotorcycleService motorcycleService;

    @PostMapping
    public MotorcycleResponse create(@Valid @RequestBody MotorcycleRequest request) {
        return motorcycleService.create(request);
    }

    @GetMapping
    public List<MotorcycleResponse> findAll() {
        return motorcycleService.findAll();
    }

    @GetMapping("/{id}")
    public MotorcycleResponse findById(@PathVariable Long id) {
        return motorcycleService.findById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<MotorcycleResponse> findByCustomer(@PathVariable Long customerId) {
        return motorcycleService.findByCustomer(customerId);
    }

    @PatchMapping("/{id}/mileage")
    public MotorcycleResponse updateMileage(@PathVariable Long id, @RequestParam Integer mileage) {
        return motorcycleService.updateMileage(id, mileage);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        motorcycleService.delete(id);
    }
}
