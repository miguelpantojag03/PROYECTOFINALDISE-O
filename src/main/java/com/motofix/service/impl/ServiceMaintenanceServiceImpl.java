package com.motofix.service.impl;

import com.motofix.dto.ServiceMaintenanceRequest;
import com.motofix.dto.ServiceMaintenanceResponse;
import com.motofix.entity.*;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.ServiceMaintenanceMapper;
import com.motofix.repository.ServiceMaintenanceRepository;
import com.motofix.service.AuditLogService;
import com.motofix.service.ServiceMaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceMaintenanceServiceImpl implements ServiceMaintenanceService {
    private final ServiceMaintenanceRepository serviceMaintenanceRepository;
    private final ServiceMaintenanceMapper serviceMaintenanceMapper;
    private final AuditLogService auditLogService;

    @Override
    public ServiceMaintenanceResponse create(ServiceMaintenanceRequest request) {
        ServiceMaintenance saved = serviceMaintenanceRepository.save(buildService(request));
        auditLogService.record("SERVICE_CREATED", "Maintenance service #" + saved.getId() + " created as " + saved.getType());
        return serviceMaintenanceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceMaintenanceResponse> findAll() {
        return serviceMaintenanceRepository.findAll().stream().map(serviceMaintenanceMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceMaintenanceResponse findById(Long id) {
        return serviceMaintenanceMapper.toResponse(getService(id));
    }

    @Override
    public ServiceMaintenanceResponse update(Long id, ServiceMaintenanceRequest request) {
        ServiceMaintenance existing = getService(id);
        if (existing.getType() != request.type()) {
            throw new BusinessException("Service type cannot be changed. Create a new service for a different type");
        }
        existing.setName(request.name());
        existing.setBasePrice(request.basePrice());
        existing.setEstimatedTime(request.estimatedTime());
        updateSpecificFields(existing, request);
        auditLogService.record("SERVICE_UPDATED", "Maintenance service #" + id + " updated");
        return serviceMaintenanceMapper.toResponse(existing);
    }

    @Override
    public void delete(Long id) {
        serviceMaintenanceRepository.delete(getService(id));
        auditLogService.record("SERVICE_DELETED", "Maintenance service #" + id + " deleted");
    }

    private ServiceMaintenance getService(Long id) {
        return serviceMaintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance service not found"));
    }

    private ServiceMaintenance buildService(ServiceMaintenanceRequest request) {
        ServiceMaintenance service = switch (request.type()) {
            case OIL_CHANGE -> {
                OilChange oilChange = new OilChange();
                oilChange.setOilType(request.oilType());
                oilChange.setOilQuantity(request.oilQuantity());
                oilChange.setFilterCost(request.filterCost());
                yield oilChange;
            }
            case BRAKE_REPAIR -> {
                BrakeRepair brakeRepair = new BrakeRepair();
                brakeRepair.setBrakeType(request.brakeType());
                brakeRepair.setRequiresReplacement(request.requiresReplacement());
                brakeRepair.setPadsCost(request.padsCost());
                brakeRepair.setLaborCost(request.laborCost());
                yield brakeRepair;
            }
            case GENERAL_INSPECTION -> {
                GeneralInspection inspection = new GeneralInspection();
                inspection.setInspectionLevel(request.inspectionLevel());
                inspection.setChecklistItems(request.checklistItems());
                yield inspection;
            }
        };
        service.setName(request.name());
        service.setBasePrice(request.basePrice());
        service.setEstimatedTime(request.estimatedTime());
        service.setType(request.type());
        return service;
    }

    private void updateSpecificFields(ServiceMaintenance service, ServiceMaintenanceRequest request) {
        if (service instanceof OilChange oilChange) {
            if (request.oilType() != null) oilChange.setOilType(request.oilType());
            if (request.oilQuantity() != null) oilChange.setOilQuantity(request.oilQuantity());
            if (request.filterCost() != null) oilChange.setFilterCost(request.filterCost());
        }
        if (service instanceof BrakeRepair brakeRepair) {
            if (request.brakeType() != null) brakeRepair.setBrakeType(request.brakeType());
            if (request.requiresReplacement() != null) brakeRepair.setRequiresReplacement(request.requiresReplacement());
            if (request.padsCost() != null) brakeRepair.setPadsCost(request.padsCost());
            if (request.laborCost() != null) brakeRepair.setLaborCost(request.laborCost());
        }
        if (service instanceof GeneralInspection inspection) {
            if (request.inspectionLevel() != null) inspection.setInspectionLevel(request.inspectionLevel());
            if (request.checklistItems() != null) inspection.setChecklistItems(request.checklistItems());
        }
    }
}
