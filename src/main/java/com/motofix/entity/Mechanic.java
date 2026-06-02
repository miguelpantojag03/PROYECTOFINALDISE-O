package com.motofix.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("MECHANIC")
public class Mechanic extends User {
    private String specialty;
    private Boolean available = true;

    public void diagnoseMotorcycle(ServiceOrder order, String diagnostic) {
        order.setDiagnostic(diagnostic);
    }

    public void updateOrderStatus(ServiceOrder order, com.motofix.model.OrderStatus status) {
        order.setStatus(status);
    }
}
