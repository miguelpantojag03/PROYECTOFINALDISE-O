package com.motofix.controller;

import com.motofix.dto.PaymentRequest;
import com.motofix.dto.PaymentResponse;
import com.motofix.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public PaymentResponse register(@Valid @RequestBody PaymentRequest request) {
        return paymentService.register(request);
    }

    @GetMapping
    public List<PaymentResponse> findAll() {
        return paymentService.findAll();
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse findByOrder(@PathVariable Long orderId) {
        return paymentService.findByOrder(orderId);
    }

    @PatchMapping("/{id}/confirm")
    public PaymentResponse confirm(@PathVariable Long id) {
        return paymentService.confirm(id);
    }
}
