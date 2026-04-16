package com.prl.backend.mapper;

import com.prl.backend.dto.response.UserResponse;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(mapRole(user.getRole()))")
    UserResponse toResponse(User user);

    default String mapRole(Role role) {
        return role != null ? role.name() : null;
    }
}
