package com.motofix.config;

import com.motofix.entity.*;
import com.motofix.model.AppointmentStatus;
import com.motofix.model.RoleName;
import com.motofix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final MechanicRepository mechanicRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final ServiceMaintenanceRepository serviceMaintenanceRepository;
    private final SparePartRepository sparePartRepository;
    private final InventoryRepository inventoryRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            createRole(RoleName.ROLE_CUSTOMER);
            createRole(RoleName.ROLE_MECHANIC);
            createRole(RoleName.ROLE_ADMINISTRATOR);

            if (!userRepository.existsByEmail("admin@motofix.com")) {
                Administrator admin = new Administrator();
                admin.setName("MotoFix Admin");
                admin.setEmail("admin@motofix.com");
                admin.setPassword(passwordEncoder.encode("Admin12345"));
                admin.setPhone("3000000000");
                admin.setAddress("MotoFix Office");
                admin.setRole(roleRepository.findByName(RoleName.ROLE_ADMINISTRATOR).orElseThrow());
                userRepository.save(admin);
            }

            if (!userRepository.existsByEmail("customer@motofix.com")) {
                Customer customer = new Customer();
                customer.setName("Demo Customer");
                customer.setEmail("customer@motofix.com");
                customer.setPassword(passwordEncoder.encode("Customer12345"));
                customer.setPhone("3001234567");
                customer.setAddress("Main Street 123");
                customer.setRole(roleRepository.findByName(RoleName.ROLE_CUSTOMER).orElseThrow());
                customerRepository.save(customer);
            }

            if (!userRepository.existsByEmail("mechanic@motofix.com")) {
                Mechanic mechanic = new Mechanic();
                mechanic.setName("Demo Mechanic");
                mechanic.setEmail("mechanic@motofix.com");
                mechanic.setPassword(passwordEncoder.encode("Mechanic12345"));
                mechanic.setSpecialty("General diagnostics");
                mechanic.setAvailable(true);
                mechanic.setRole(roleRepository.findByName(RoleName.ROLE_MECHANIC).orElseThrow());
                mechanicRepository.save(mechanic);
            }

            if (motorcycleRepository.count() == 0) {
                Customer customer = customerRepository.findAll().stream().findFirst().orElseThrow();
                Motorcycle motorcycle = new Motorcycle();
                motorcycle.setBrand("Yamaha");
                motorcycle.setModel("FZ 2.0");
                motorcycle.setYear(2022);
                motorcycle.setMileage(15000);
                motorcycle.setPlate("ABC123");
                motorcycle.setVin("VIN001");
                motorcycle.setCustomer(customer);
                motorcycleRepository.save(motorcycle);
            }

            if (serviceMaintenanceRepository.count() == 0) {
                OilChange oilChange = new OilChange();
                oilChange.setName("Synthetic oil change");
                oilChange.setBasePrice(BigDecimal.valueOf(35));
                oilChange.setEstimatedTime(45);
                oilChange.setOilType("Synthetic 10W-40");
                oilChange.setOilQuantity(BigDecimal.valueOf(1.2));
                oilChange.setFilterCost(BigDecimal.valueOf(8));
                serviceMaintenanceRepository.save(oilChange);

                BrakeRepair brakeRepair = new BrakeRepair();
                brakeRepair.setName("Front brake repair");
                brakeRepair.setBasePrice(BigDecimal.valueOf(50));
                brakeRepair.setEstimatedTime(90);
                brakeRepair.setBrakeType("Front disc brake");
                brakeRepair.setRequiresReplacement(true);
                brakeRepair.setPadsCost(BigDecimal.valueOf(25));
                brakeRepair.setLaborCost(BigDecimal.valueOf(30));
                serviceMaintenanceRepository.save(brakeRepair);
            }

            if (sparePartRepository.count() == 0) {
                SparePart filter = new SparePart();
                filter.setName("Oil filter");
                filter.setBrand("Generic");
                filter.setSku("FLT-001");
                filter.setUnitPrice(BigDecimal.valueOf(8));
                filter.setStock(20);
                sparePartRepository.save(filter);

                Inventory inventory = new Inventory();
                inventory.setSparePart(filter);
                inventory.setStock(20);
                inventoryRepository.save(inventory);
            }

            if (appointmentRepository.count() == 0) {
                Customer customer = customerRepository.findAll().stream().findFirst().orElseThrow();
                Motorcycle motorcycle = motorcycleRepository.findAll().stream().findFirst().orElseThrow();
                Appointment appointment = new Appointment();
                appointment.setCustomer(customer);
                appointment.setMotorcycle(motorcycle);
                appointment.setScheduledAt(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0));
                appointment.setStatus(AppointmentStatus.SCHEDULED);
                appointment.setReason("Revision preventiva");
                appointment.setNotes("Verificar frenos, aceite y estado general antes de viaje.");
                appointment.setCreatedAt(LocalDateTime.now());
                appointmentRepository.save(appointment);
            }
        };
    }

    private void createRole(RoleName roleName) {
        roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
    }
}
