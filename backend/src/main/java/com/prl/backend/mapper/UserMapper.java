package com.prl.backend.mapper;

import com.prl.backend.dto.response.UserResponse;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(mapRole(user.getRole()))")
    @Mapping(target = "companyId", expression = "java(user.getCompany().getId())")
    @Mapping(target = "companyName", expression = "java(user.getCompany().getName())")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    default String mapRole(Role role) {
        return role != null ? role.name() : null;
    }
}
