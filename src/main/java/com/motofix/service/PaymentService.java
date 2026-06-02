package com.motofix.service;

import com.motofix.dto.PaymentRequest;
import com.motofix.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {
    PaymentResponse register(PaymentRequest request);
    PaymentResponse findByOrder(Long orderId);
    PaymentResponse confirm(Long id);
    List<PaymentResponse> findAll();
}
