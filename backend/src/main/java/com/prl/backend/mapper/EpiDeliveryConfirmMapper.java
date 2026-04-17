package com.prl.backend.mapper;

import com.prl.backend.dto.response.EpiDeliveryConfirmResponse;
import com.prl.backend.entity.EpiDeliveryConfirm;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EpiDeliveryConfirmMapper {

    @Mapping(target = "workerId",   expression = "java(confirm.getWorker().getId())")
    @Mapping(target = "workerName", expression = "java(confirm.getWorker().getName())")
    EpiDeliveryConfirmResponse toResponse(EpiDeliveryConfirm confirm);
}
