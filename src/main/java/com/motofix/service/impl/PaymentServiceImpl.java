package com.motofix.service.impl;

import com.motofix.dto.PaymentRequest;
import com.motofix.dto.PaymentResponse;
import com.motofix.entity.Payment;
import com.motofix.entity.ServiceOrder;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.PaymentMapper;
import com.motofix.model.PaymentStatus;
import com.motofix.repository.PaymentRepository;
import com.motofix.repository.ServiceOrderRepository;
import com.motofix.service.AuditLogService;
import com.motofix.service.PaymentGatewayService;
import com.motofix.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentGatewayService paymentGatewayService;
    private final AuditLogService auditLogService;

    @Override
    public PaymentResponse register(PaymentRequest request) {
        ServiceOrder order = serviceOrderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found"));
        paymentRepository.findByServiceOrderId(request.orderId())
                .ifPresent(existing -> {
                    throw new BusinessException("Payment already exists for this order");
                });
        if (order.calculateTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Cannot register a payment for an order without charges");
        }
        Payment payment = Payment.builder()
                .serviceOrder(order)
                .amount(order.calculateTotal())
                .type(request.type())
                .status(PaymentStatus.PENDING)
                .build();
        if (!paymentGatewayService.processPayment(payment.getAmount(), request.type())) {
            throw new BusinessException("Payment gateway rejected the transaction");
        }
        Payment saved = paymentRepository.save(payment);
        auditLogService.record("PAYMENT_REGISTERED", "Payment #" + saved.getId() + " registered for order #" + request.orderId());
        return paymentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse findByOrder(Long orderId) {
        return paymentRepository.findByServiceOrderId(orderId)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    @Override
    public PaymentResponse confirm(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.processPayment();
        auditLogService.record("PAYMENT_CONFIRMED", "Payment #" + id + " confirmed");
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentRepository.findAll().stream().map(paymentMapper::toResponse).toList();
    }
}
