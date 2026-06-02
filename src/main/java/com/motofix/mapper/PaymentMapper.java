package com.motofix.mapper;

import com.motofix.dto.PaymentResponse;
import com.motofix.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public PaymentResponse toResponse(Payment payment) {
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
