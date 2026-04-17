package com.prl.backend.mapper;

import com.prl.backend.dto.response.EpiDeliveryItemResponse;
import com.prl.backend.entity.EpiDeliveryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EpiDeliveryItemMapper {

    @Mapping(target = "epiCatalogId",   expression = "java(item.getEpiCatalog().getId())")
    @Mapping(target = "epiCatalogName", expression = "java(item.getEpiCatalog().getName())")
    @Mapping(target = "referenceCode",  expression = "java(item.getEpiCatalog().getReferenceCode())")
    EpiDeliveryItemResponse toResponse(EpiDeliveryItem item);

    List<EpiDeliveryItemResponse> toResponseList(List<EpiDeliveryItem> items);
}
