package com.motofix.mapper;

import com.motofix.dto.MotorcycleResponse;
import com.motofix.entity.Motorcycle;
import org.springframework.stereotype.Component;

@Component
public class MotorcycleMapper {
    public MotorcycleResponse toResponse(Motorcycle motorcycle) {
        if (motorcycle == null) {
            return null;
        }
        return new MotorcycleResponse(
                motorcycle.getId(),
                motorcycle.getBrand(),
                motorcycle.getModel(),
                motorcycle.getYear(),
                motorcycle.getMileage(),
                motorcycle.getPlate(),
                motorcycle.getVin(),
                motorcycle.getCustomer().getId(),
                motorcycle.getCustomer().getName()
        );
    }
}
