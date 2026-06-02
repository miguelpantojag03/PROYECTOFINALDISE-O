package com.motofix.service;

import com.motofix.model.PaymentType;

import java.math.BigDecimal;

public interface PaymentGatewayService {
    boolean processPayment(BigDecimal amount, PaymentType type);
}
