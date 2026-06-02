package com.motofix.entity;

import com.motofix.model.ServiceType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@DiscriminatorValue("BRAKE_REPAIR")
public class BrakeRepair extends ServiceMaintenance {
    private String brakeType;
    private Boolean requiresReplacement = false;
    private BigDecimal padsCost = BigDecimal.ZERO;
    private BigDecimal laborCost = BigDecimal.ZERO;

    public BrakeRepair() {
        setType(ServiceType.BRAKE_REPAIR);
    }

    @Override
    public BigDecimal calculateCost() {
        return getBasePrice()
                .add(Boolean.TRUE.equals(requiresReplacement) ? (padsCost == null ? BigDecimal.ZERO : padsCost) : BigDecimal.ZERO)
                .add(laborCost == null ? BigDecimal.ZERO : laborCost);
    }

    @Override
    public String getDescription() {
        return "Brake repair service for " + brakeType;
    }
}
