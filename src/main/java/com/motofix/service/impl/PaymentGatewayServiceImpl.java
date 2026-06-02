package com.motofix.service.impl;

import com.motofix.domain.*;
import com.motofix.model.PaymentType;
import com.motofix.service.PaymentGatewayService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PaymentGatewayServiceImpl implements PaymentGatewayService {
    @Override
    public boolean processPayment(BigDecimal amount, PaymentType type) {
        return method(type).pay(amount);
    }

    private PaymentMethod method(PaymentType type) {
        return switch (type) {
            case CASH -> new CashPayment();
            case CARD -> new CardPayment();
            case TRANSFER -> new TransferPayment();
        };
    }
}
