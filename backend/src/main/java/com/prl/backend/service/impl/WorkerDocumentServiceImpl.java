package com.prl.backend.service.impl;

import com.prl.backend.dto.request.ReviewDocumentRequest;
import com.prl.backend.dto.request.UploadWorkerDocumentRequest;
import com.prl.backend.dto.response.WorkerDocumentResponse;
import com.prl.backend.entity.*;
import com.prl.backend.entity.enums.DocumentStatus;
import com.prl.backend.entity.enums.NotificationType;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.mapper.WorkerDocumentMapper;
import com.prl.backend.repository.DocumentTypeRepository;
import com.prl.backend.repository.PositionDocumentReqRepository;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.repository.WorkerDocumentRepository;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.MinioService;
import com.prl.backend.service.NotificationService;
import com.prl.backend.service.WorkerDocumentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerDocumentServiceImpl implements WorkerDocumentService {

    private final WorkerDocumentRepository workerDocumentRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final PositionDocumentReqRepository positionDocumentReqRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;
    private final WorkerDocumentMapper workerDocumentMapper;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Override
    public WorkerDocumentResponse upload(UploadWorkerDocumentRequest request, MultipartFile file) {
        User currentUser = securityUtils.getCurrentUser();

        DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tipo de documento no encontrado: " + request.getDocumentTypeId()));

        if (!documentType.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("El tipo de documento no pertenece a su empresa.");
        }

        if (documentType.isRequiresExpiry() && request.getExpiryDate() == null) {
            throw new IllegalArgumentException(
                    "Este tipo de documento requiere fecha de caducidad");
        }

        FileMetadata fileMetadata = minioService.uploadFile(file, currentUser);

        WorkerDocument workerDocument = WorkerDocument.builder()
                .worker(currentUser)
                .documentType(documentType)
                .fileMetadata(fileMetadata)
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .build();

        workerDocument = workerDocumentRepository.save(workerDocument);

        return enrichResponse(workerDocument);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkerDocumentResponse getById(Long id) {
        WorkerDocument doc = workerDocumentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Documento no encontrado: " + id));

        User currentUser = securityUtils.getCurrentUser();
        if (!doc.getWorker().getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("El documento no pertenece a su empresa.");
        }

        return enrichResponse(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkerDocumentResponse> getMyDocuments() {
        User currentUser = securityUtils.getCurrentUser();
        List<WorkerDocument> docs = workerDocumentRepository.findByWorkerId(currentUser.getId());
        return enrichResponseList(docs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkerDocumentResponse> getByWorker(Long workerId) {
        User currentUser = securityUtils.getCurrentUser();

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Trabajador no encontrado: " + workerId));

        if (!worker.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("El trabajador no pertenece a su empresa.");
        }

        List<WorkerDocument> docs = workerDocumentRepository.findByWorkerId(workerId);
        return enrichResponseList(docs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkerDocumentResponse> getPendingReview() {
        Long companyId = securityUtils.getCurrentCompanyId();
        List<WorkerDocument> docs = workerDocumentRepository
                .findByWorkerCompanyIdAndStatus(companyId, DocumentStatus.PENDING_REVIEW);
        return enrichResponseList(docs);
    }

    @Override
    public WorkerDocumentResponse review(Long id, ReviewDocumentRequest request) {
        User reviewer = securityUtils.getCurrentUser();

        if (reviewer.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Solo un ADMIN puede revisar documentos.");
        }

        if (request.getStatus() != DocumentStatus.APPROVED
                && request.getStatus() != DocumentStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "El estado de revisión solo puede ser APPROVED o REJECTED.");
        }

        if (request.getStatus() == DocumentStatus.REJECTED
                && (request.getRejectionReason() == null
                || request.getRejectionReason().isBlank())) {
            throw new IllegalArgumentException(
                    "Debe indicar un motivo de rechazo cuando el estado es REJECTED.");
        }

        WorkerDocument doc = workerDocumentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Documento no encontrado: " + id));

        if (!doc.getWorker().getCompany().getId().equals(reviewer.getCompany().getId())) {
            throw new IllegalArgumentException("El documento no pertenece a su empresa.");
        }

        doc.setStatus(request.getStatus());
        doc.setReviewedBy(reviewer);
        doc.setReviewedAt(LocalDateTime.now());
        doc.setRejectionReason(
                request.getStatus() == DocumentStatus.REJECTED
                        ? request.getRejectionReason()
                        : null);

        doc = workerDocumentRepository.save(doc);

        if (doc.getStatus() == DocumentStatus.APPROVED) {
            notificationService.create(
                    doc.getWorker(),
                    NotificationType.DOCUMENT_APPROVED,
                    "Documento aprobado",
                    "Tu documento '" + doc.getDocumentType().getName() + "' ha sido aprobado",
                    "WORKER_DOCUMENT", doc.getId());
        } else if (doc.getStatus() == DocumentStatus.REJECTED) {
            notificationService.create(
                    doc.getWorker(),
                    NotificationType.DOCUMENT_REJECTED,
                    "Documento rechazado",
                    "Tu documento '" + doc.getDocumentType().getName() +
                            "' ha sido rechazado. Motivo: " + request.getRejectionReason(),
                    "WORKER_DOCUMENT", doc.getId());
        }

        return enrichResponse(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getComplianceStatus(Long workerId) {
        User currentUser = securityUtils.getCurrentUser();

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Trabajador no encontrado: " + workerId));

        if (!worker.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("El trabajador no pertenece a su empresa.");
        }

        List<PositionDocumentReq> requirements = worker.getJobPosition() != null
                ? positionDocumentReqRepository
                .findByJobPositionIdAndActiveTrue(worker.getJobPosition().getId())
                : Collections.emptyList();

        long totalRequired = requirements.stream()
                .filter(PositionDocumentReq::isMandatory)
                .count();

        Set<Long> mandatoryDocTypeIds = requirements.stream()
                .filter(PositionDocumentReq::isMandatory)
                .map(r -> r.getDocumentType().getId())
                .collect(Collectors.toSet());

        List<WorkerDocument> workerDocs = workerDocumentRepository.findByWorkerId(workerId);

        Map<Long, WorkerDocument> latestByDocType = new HashMap<>();
        for (WorkerDocument doc : workerDocs) {
            Long docTypeId = doc.getDocumentType().getId();
            if (mandatoryDocTypeIds.contains(docTypeId)) {
                latestByDocType.merge(docTypeId, doc, (existing, newer) ->
                        newer.getUploadedAt().isAfter(existing.getUploadedAt()) ? newer : existing);
            }
        }

        long totalApproved = latestByDocType.values().stream()
                .filter(d -> d.getStatus() == DocumentStatus.APPROVED)
                .count();

        long totalPending = latestByDocType.values().stream()
                .filter(d -> d.getStatus() == DocumentStatus.PENDING_REVIEW)
                .count();

        long totalExpired = latestByDocType.values().stream()
                .filter(d -> d.getStatus() == DocumentStatus.EXPIRED)
                .count();

        long totalMissing = mandatoryDocTypeIds.size() - latestByDocType.size();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRequired", totalRequired);
        result.put("totalApproved", totalApproved);
        result.put("totalPending", totalPending);
        result.put("totalMissing", totalMissing);
        result.put("totalExpired", totalExpired);
        result.put("compliant", totalApproved == totalRequired);

        return result;
    }

    private WorkerDocumentResponse enrichResponse(WorkerDocument doc) {
        WorkerDocumentResponse response = workerDocumentMapper.toResponse(doc);
        response.setDownloadUrl(minioService.getPresignedUrl(doc.getFileMetadata()));
        response.setExpiringSoon(
                doc.getExpiryDate() != null
                        && doc.getExpiryDate().isBefore(LocalDate.now().plusDays(30)));
        return response;
    }

    private List<WorkerDocumentResponse> enrichResponseList(List<WorkerDocument> docs) {
        return docs.stream()
                .map(doc -> {
                    WorkerDocumentResponse response = workerDocumentMapper.toResponse(doc);
                    response.setDownloadUrl(null);
                    response.setExpiringSoon(
                            doc.getExpiryDate() != null
                                    && doc.getExpiryDate().isBefore(LocalDate.now().plusDays(30)));
                    return response;
                })
                .collect(Collectors.toList());
    }
}
