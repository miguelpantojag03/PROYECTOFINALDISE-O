package com.motofix.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {
    private String phone;
    private String address;

    public Motorcycle registerMotorcycle(Motorcycle motorcycle) {
        motorcycle.setCustomer(this);
        return motorcycle;
    }

    public ServiceOrder requestService(Motorcycle motorcycle) {
        return ServiceOrder.builder()
                .customer(this)
                .motorcycle(motorcycle)
                .build();
    }
}
