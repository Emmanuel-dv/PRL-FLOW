package com.prl.backend.service;

import com.prl.backend.dto.request.ReviewDocumentRequest;
import com.prl.backend.dto.request.UploadWorkerDocumentRequest;
import com.prl.backend.dto.response.WorkerDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface WorkerDocumentService {

    WorkerDocumentResponse upload(UploadWorkerDocumentRequest request, MultipartFile file);

    WorkerDocumentResponse getById(Long id);

    List<WorkerDocumentResponse> getMyDocuments();

    List<WorkerDocumentResponse> getByWorker(Long workerId);

    List<WorkerDocumentResponse> getPendingReview();

    WorkerDocumentResponse review(Long id, ReviewDocumentRequest request);

    Map<String, Object> getComplianceStatus(Long workerId);
}
