package com.prl.backend.mapper;

import com.prl.backend.dto.response.NotificationResponse;
import com.prl.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "read", source = "read")
    @Mapping(target = "type", expression = "java(notification.getType().name())")
    NotificationResponse toResponse(Notification notification);

    List<NotificationResponse> toResponseList(List<Notification> notifications);
}
