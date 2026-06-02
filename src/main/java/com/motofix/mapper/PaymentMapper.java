package com.motofix.mapper;

import com.motofix.dto.PaymentResponse;
import com.motofix.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    default PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getServiceOrder().getId(),
                payment.getAmount(),
                payment.getType(),
                payment.getStatus(),
                payment.getPaidAt()
        );
    }
}
