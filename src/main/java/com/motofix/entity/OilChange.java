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
@DiscriminatorValue("OIL_CHANGE")
public class OilChange extends ServiceMaintenance {
    private String oilType;
    private BigDecimal oilQuantity = BigDecimal.ZERO;
    private BigDecimal filterCost = BigDecimal.ZERO;

    public OilChange() {
        setType(ServiceType.OIL_CHANGE);
    }

    @Override
    public BigDecimal calculateCost() {
        return getBasePrice().add(filterCost == null ? BigDecimal.ZERO : filterCost);
    }

    @Override
    public String getDescription() {
        return "Oil change service with " + oilType + " and " + oilQuantity + " liters";
    }
}
