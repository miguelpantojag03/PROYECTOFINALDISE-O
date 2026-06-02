package com.motofix.service.impl;

import com.motofix.dto.ServiceMaintenanceRequest;
import com.motofix.dto.ServiceMaintenanceResponse;
import com.motofix.entity.*;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.ServiceMaintenanceMapper;
import com.motofix.repository.ServiceMaintenanceRepository;
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

    @Override
    public ServiceMaintenanceResponse create(ServiceMaintenanceRequest request) {
        return serviceMaintenanceMapper.toResponse(serviceMaintenanceRepository.save(buildService(request)));
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
        existing.setName(request.name());
        existing.setBasePrice(request.basePrice());
        existing.setEstimatedTime(request.estimatedTime());
        return serviceMaintenanceMapper.toResponse(existing);
    }

    @Override
    public void delete(Long id) {
        serviceMaintenanceRepository.delete(getService(id));
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
}
