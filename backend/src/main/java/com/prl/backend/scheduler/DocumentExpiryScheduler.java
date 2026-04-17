package com.prl.backend.scheduler;

import com.prl.backend.entity.WorkerDocument;
import com.prl.backend.entity.enums.DocumentStatus;
import com.prl.backend.repository.WorkerDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentExpiryScheduler {

    private final WorkerDocumentRepository workerDocumentRepository;

    @Scheduled(cron = "0 0 8 * * *")
    public void checkDocumentExpiry() {
        LocalDate today = LocalDate.now();

        List<WorkerDocument> expired = workerDocumentRepository.findExpired(today);
        expired.forEach(doc -> {
            doc.setStatus(DocumentStatus.EXPIRED);
            log.warn("Document expired: {} for worker: {}",
                    doc.getDocumentType().getName(),
                    doc.getWorker().getEmail());
        });
        workerDocumentRepository.saveAll(expired);

        List<WorkerDocument> expiringSoon =
                workerDocumentRepository.findExpiringSoon(today, today.plusDays(30));
        expiringSoon.forEach(doc ->
                log.info("Document expiring soon: {} for worker: {} on {}",
                        doc.getDocumentType().getName(),
                        doc.getWorker().getEmail(),
                        doc.getExpiryDate()));
    }
}
