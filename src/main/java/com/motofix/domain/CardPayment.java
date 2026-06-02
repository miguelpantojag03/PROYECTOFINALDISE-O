package com.motofix.domain;

import java.math.BigDecimal;

public class CardPayment implements PaymentMethod {
    @Override
    public boolean pay(BigDecimal amount) {
        return amount.signum() >= 0;
    }
}
