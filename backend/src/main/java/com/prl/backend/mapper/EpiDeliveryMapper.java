package com.prl.backend.mapper;

import com.prl.backend.dto.response.EpiDeliveryItemResponse;
import com.prl.backend.dto.response.EpiDeliveryResponse;
import com.prl.backend.entity.EpiDelivery;
import com.prl.backend.entity.EpiDeliveryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {EpiDeliveryItemMapper.class})
public interface EpiDeliveryMapper {

    @Mapping(target = "companyId",   expression = "java(delivery.getCompany().getId())")
    @Mapping(target = "managerId",   expression = "java(delivery.getManager().getId())")
    @Mapping(target = "managerName", expression = "java(delivery.getManager().getName())")
    @Mapping(target = "workerId",    expression = "java(delivery.getWorker().getId())")
    @Mapping(target = "workerName",  expression = "java(delivery.getWorker().getName())")
    @Mapping(target = "status",      expression = "java(delivery.getStatus().name())")
    @Mapping(target = "items",       ignore = true)
    @Mapping(target = "confirmation", ignore = true)
    EpiDeliveryResponse toResponse(EpiDelivery delivery);

    List<EpiDeliveryResponse> toResponseList(List<EpiDelivery> deliveries);
}
