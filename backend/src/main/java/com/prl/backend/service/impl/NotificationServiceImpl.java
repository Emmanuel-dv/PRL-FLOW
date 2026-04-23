package com.prl.backend.service.impl;

import com.prl.backend.dto.response.NotificationResponse;
import com.prl.backend.entity.Notification;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.NotificationType;
import com.prl.backend.mapper.NotificationMapper;
import com.prl.backend.repository.NotificationRepository;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SecurityUtils securityUtils;

    @Override
    public NotificationResponse create(User user, NotificationType type,
                                       String title, String message,
                                       String relatedEntityType, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build();

        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        Long userId = securityUtils.getCurrentUser().getId();
        return notificationMapper.toResponseList(
                notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnread() {
        Long userId = securityUtils.getCurrentUser().getId();
        return notificationMapper.toResponseList(
                notificationRepository.findByUser_IdAndIsReadFalse(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread() {
        Long userId = securityUtils.getCurrentUser().getId();
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        Long userId = securityUtils.getCurrentUser().getId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Notificación no encontrada: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("La notificación no pertenece al usuario actual.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead() {
        Long userId = securityUtils.getCurrentUser().getId();
        List<Notification> unread = notificationRepository.findByUser_IdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
