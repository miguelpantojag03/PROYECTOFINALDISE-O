package com.motofix.repository;

import com.motofix.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    List<ServiceOrder> findByCustomerId(Long customerId);
    List<ServiceOrder> findByMechanicId(Long mechanicId);
}
