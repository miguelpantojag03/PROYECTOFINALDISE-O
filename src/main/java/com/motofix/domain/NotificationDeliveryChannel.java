package com.motofix.domain;

public interface NotificationDeliveryChannel {
    void send(String recipient, String message);
}
