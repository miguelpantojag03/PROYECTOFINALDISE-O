package com.motofix.service;

import com.motofix.dto.NotificationRequest;
import com.motofix.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse send(NotificationRequest request);
    List<NotificationResponse> findByUser(Long userId);
    NotificationResponse markAsRead(Long id);
}
