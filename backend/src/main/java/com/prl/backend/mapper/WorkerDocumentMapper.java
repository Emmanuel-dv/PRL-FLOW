package com.prl.backend.mapper;

import com.prl.backend.dto.response.WorkerDocumentResponse;
import com.prl.backend.entity.WorkerDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkerDocumentMapper {

    @Mapping(target = "workerId",         expression = "java(doc.getWorker().getId())")
    @Mapping(target = "workerName",       expression = "java(doc.getWorker().getName())")
    @Mapping(target = "documentTypeId",   expression = "java(doc.getDocumentType().getId())")
    @Mapping(target = "documentTypeName", expression = "java(doc.getDocumentType().getName())")
    @Mapping(target = "fileMetadataId",   expression = "java(doc.getFileMetadata().getId())")
    @Mapping(target = "originalFilename", expression = "java(doc.getFileMetadata().getOriginalFilename())")
    @Mapping(target = "status",           expression = "java(doc.getStatus().name())")
    @Mapping(target = "reviewedById",     expression = "java(doc.getReviewedBy() != null ? doc.getReviewedBy().getId() : null)")
    @Mapping(target = "reviewedByName",   expression = "java(doc.getReviewedBy() != null ? doc.getReviewedBy().getName() : null)")
    @Mapping(target = "downloadUrl",          ignore = true)
    @Mapping(target = "expiringSoon",         ignore = true)
    @Mapping(target = "documentTypeMandatory", ignore = true)
    WorkerDocumentResponse toResponse(WorkerDocument doc);

    List<WorkerDocumentResponse> toResponseList(List<WorkerDocument> docs);
}
