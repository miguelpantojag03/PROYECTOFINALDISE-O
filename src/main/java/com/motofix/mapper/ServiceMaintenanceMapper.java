package com.motofix.mapper;

import com.motofix.dto.ServiceMaintenanceResponse;
import com.motofix.entity.ServiceMaintenance;
import org.springframework.stereotype.Component;

@Component
public class ServiceMaintenanceMapper {
    public ServiceMaintenanceResponse toResponse(ServiceMaintenance service) {
        if (service == null) {
            return null;
        }
        return new ServiceMaintenanceResponse(
                service.getId(),
                service.getName(),
                service.getType(),
                service.getBasePrice(),
                service.getEstimatedTime(),
                service.calculateCost(),
                service.getDescription()
        );
    }
}
