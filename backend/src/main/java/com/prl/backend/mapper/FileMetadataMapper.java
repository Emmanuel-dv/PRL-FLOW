package com.prl.backend.mapper;

import com.prl.backend.dto.response.FileMetadataResponse;
import com.prl.backend.entity.FileMetadata;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FileMetadataMapper {

    @Mapping(target = "downloadUrl", ignore = true)
    FileMetadataResponse toResponse(FileMetadata fm);

    List<FileMetadataResponse> toResponseList(List<FileMetadata> list);
}
