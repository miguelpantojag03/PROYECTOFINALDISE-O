package com.motofix.domain;

import java.math.BigDecimal;

public interface PaymentMethod {
    boolean pay(BigDecimal amount);
}
