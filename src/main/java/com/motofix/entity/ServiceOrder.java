package com.motofix.entity;

import com.motofix.model.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ordenes_servicio")
public class ServiceOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", nullable = false)
    private Motorcycle motorcycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id")
    private Mechanic mechanic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    private String diagnostic;
    private LocalDateTime createdAt;
    private LocalDateTime finishedAt;

    @ManyToMany
    @JoinTable(
            name = "orden_servicio_detalle",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    @Builder.Default
    private List<ServiceMaintenance> services = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "orden_repuesto",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "spare_part_id")
    )
    @Builder.Default
    private List<SparePart> spareParts = new ArrayList<>();

    @OneToOne(mappedBy = "serviceOrder")
    private Payment payment;

    public BigDecimal calculateTotal() {
        BigDecimal servicesTotal = services.stream()
                .map(ServiceMaintenance::calculateCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal partsTotal = spareParts.stream()
                .map(SparePart::getUnitPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return servicesTotal.add(partsTotal);
    }
}
