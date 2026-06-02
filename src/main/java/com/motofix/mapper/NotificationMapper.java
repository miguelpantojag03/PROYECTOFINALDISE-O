package com.motofix.mapper;

import com.motofix.dto.NotificationResponse;
import com.motofix.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getMessage(),
                notification.getChannel(),
                notification.getReadFlag(),
                notification.getSentAt()
        );
    }
}
