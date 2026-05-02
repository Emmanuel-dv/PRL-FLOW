package com.prl.backend.scheduler;

import com.prl.backend.entity.User;
import com.prl.backend.entity.WorkerDocument;
import com.prl.backend.entity.enums.DocumentStatus;
import com.prl.backend.entity.enums.NotificationType;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.repository.WorkerDocumentRepository;
import com.prl.backend.service.NotificationService;
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
    private final NotificationService notificationService;
    private final UserRepository userRepository;


    //Ejecutar cron 3 am
    @Scheduled(cron = "0 0 8 * * *")
    public void checkDocumentExpiry() {
        LocalDate today = LocalDate.now();

        List<WorkerDocument> expired = workerDocumentRepository.findExpired(today);
        expired.forEach(doc -> doc.setStatus(DocumentStatus.EXPIRED));
        workerDocumentRepository.saveAll(expired);

        expired.forEach(doc -> {
            log.warn("Document expired: {} for worker: {}",
                    doc.getDocumentType().getName(), doc.getWorker().getEmail());

            notificationService.create(
                    doc.getWorker(),
                    NotificationType.DOCUMENT_EXPIRED,
                    "Documento caducado",
                    "Tu documento '" + doc.getDocumentType().getName() +
                            "' ha caducado. Por favor súbelo de nuevo.",
                    "WORKER_DOCUMENT", doc.getId());

            List<User> admins = userRepository.findByCompany_IdAndRole(
                    doc.getWorker().getCompany().getId(), Role.ADMIN);
            admins.forEach(admin -> notificationService.create(
                    admin,
                    NotificationType.DOCUMENT_EXPIRED,
                    "Documento de trabajador caducado",
                    "El documento '" + doc.getDocumentType().getName() +
                            "' del trabajador " + doc.getWorker().getName() + " ha caducado.",
                    "WORKER_DOCUMENT", doc.getId()));
        });

        List<WorkerDocument> expiringSoon =
                workerDocumentRepository.findExpiringSoon(today, today.plusDays(30));
        expiringSoon.forEach(doc -> {
            log.info("Document expiring soon: {} for worker: {} on {}",
                    doc.getDocumentType().getName(),
                    doc.getWorker().getEmail(),
                    doc.getExpiryDate());

            notificationService.create(
                    doc.getWorker(),
                    NotificationType.DOCUMENT_EXPIRING_SOON,
                    "Documento próximo a caducar",
                    "Tu documento '" + doc.getDocumentType().getName() +
                            "' caduca el " + doc.getExpiryDate(),
                    "WORKER_DOCUMENT", doc.getId());
        });
    }
}
