package com.motofix.service.impl;

import com.motofix.domain.*;
import com.motofix.dto.NotificationRequest;
import com.motofix.dto.NotificationResponse;
import com.motofix.entity.Notification;
import com.motofix.entity.User;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.NotificationMapper;
import com.motofix.model.NotificationChannel;
import com.motofix.repository.NotificationRepository;
import com.motofix.repository.UserRepository;
import com.motofix.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponse send(NotificationRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        channel(request.channel()).send(user.getEmail(), request.message());
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(request.message());
        notification.setChannel(request.channel());
        notification.setReadFlag(false);
        notification.setSentAt(LocalDateTime.now());
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> findByUser(Long userId) {
        return notificationRepository.findByUserId(userId).stream().map(notificationMapper::toResponse).toList();
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setReadFlag(true);
        return notificationMapper.toResponse(notification);
    }

    private NotificationDeliveryChannel channel(NotificationChannel channel) {
        return switch (channel) {
            case EMAIL -> new EmailNotification();
            case SMS -> new SmsNotification();
            case PUSH -> new PushNotification();
        };
    }
}
