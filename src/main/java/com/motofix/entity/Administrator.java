package com.motofix.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("ADMINISTRATOR")
public class Administrator extends User {
    private String phone;
    private String address;

    public Motorcycle registerMotorcycle(Motorcycle motorcycle) {
        return motorcycle;
    }

    public ServiceOrder requestService(Customer customer, Motorcycle motorcycle) {
        return ServiceOrder.builder()
                .customer(customer)
                .motorcycle(motorcycle)
                .build();
    }
}
