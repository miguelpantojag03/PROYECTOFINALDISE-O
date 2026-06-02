package com.motofix.entity;

import com.motofix.model.ServiceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "servicios_mantenimiento")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "service_kind")
public abstract class ServiceMaintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private Integer estimatedTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType type;

    public abstract BigDecimal calculateCost();

    public abstract String getDescription();
}
