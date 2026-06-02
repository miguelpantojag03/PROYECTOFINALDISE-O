package com.motofix.domain;

import java.math.BigDecimal;

public class TransferPayment implements PaymentMethod {
    @Override
    public boolean pay(BigDecimal amount) {
        return amount.signum() >= 0;
    }
}
