package com.prl.backend.service;

import com.prl.backend.dto.response.NotificationResponse;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    NotificationResponse create(User user, NotificationType type,
                                String title, String message,
                                String relatedEntityType, Long relatedEntityId);

    List<NotificationResponse> getMyNotifications();

    List<NotificationResponse> getMyUnread();

    long countUnread();

    void markAsRead(Long notificationId);

    void markAllAsRead();
}
