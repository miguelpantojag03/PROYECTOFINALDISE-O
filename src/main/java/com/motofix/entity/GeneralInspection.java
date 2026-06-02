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
@DiscriminatorValue("GENERAL_INSPECTION")
public class GeneralInspection extends ServiceMaintenance {
    private String inspectionLevel;
    private Integer checklistItems = 20;

    public GeneralInspection() {
        setType(ServiceType.GENERAL_INSPECTION);
    }

    @Override
    public BigDecimal calculateCost() {
        BigDecimal itemFee = BigDecimal.valueOf(checklistItems == null ? 0 : checklistItems).multiply(BigDecimal.valueOf(2));
        return getBasePrice().add(itemFee);
    }

    @Override
    public String getDescription() {
        return "General inspection level " + inspectionLevel + " with " + checklistItems + " checklist items";
    }
}
