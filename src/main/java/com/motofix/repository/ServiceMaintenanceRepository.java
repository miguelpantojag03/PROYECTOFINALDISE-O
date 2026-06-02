package com.motofix.repository;

import com.motofix.entity.ServiceMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceMaintenanceRepository extends JpaRepository<ServiceMaintenance, Long> {
}
