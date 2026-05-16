package com.prl.backend.service.impl;

import com.prl.backend.dto.response.DashboardResponse;
import com.prl.backend.entity.User;
import com.prl.backend.entity.WorkerDocument;
import com.prl.backend.entity.enums.DeliveryStatus;
import com.prl.backend.entity.enums.DocumentStatus;
import com.prl.backend.entity.enums.IncidentSeverity;
import com.prl.backend.entity.enums.IncidentStatus;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.repository.EpiDeliveryRepository;
import com.prl.backend.repository.IncidentRepository;
import com.prl.backend.repository.NotificationRepository;
import com.prl.backend.repository.PositionDocumentReqRepository;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.repository.WorkerDocumentRepository;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

        private final UserRepository userRepository;
        private final WorkerDocumentRepository workerDocumentRepository;
        private final EpiDeliveryRepository epiDeliveryRepository;
        private final IncidentRepository incidentRepository;
        private final NotificationRepository notificationRepository;
        private final PositionDocumentReqRepository positionDocumentReqRepository;
        private final SecurityUtils securityUtils;

        @Override
        public DashboardResponse getDashboard() {
                Long companyId = securityUtils.getCurrentCompanyId();
                LocalDate today = LocalDate.now();

                long totalWorkers = userRepository.countByCompany_IdAndRoleAndActiveTrue(companyId, Role.WORKER);
                long totalManagers = userRepository.countByCompany_IdAndRoleAndActiveTrue(companyId, Role.MANAGER);
                long activeUsers = userRepository.countByCompany_IdAndActiveTrue(companyId);

                long pendingReview = workerDocumentRepository
                                .countByWorkerCompanyIdAndStatus(companyId, DocumentStatus.PENDING_REVIEW);
                long expiredDocs = workerDocumentRepository
                                .countByWorkerCompanyIdAndStatus(companyId, DocumentStatus.EXPIRED);
                long expiringSoon = workerDocumentRepository.findExpiringSoon(today, today.plusDays(30))
                                .stream()
                                .filter(d -> d.getWorker().getCompany().getId().equals(companyId))
                                .count();

                long complianceRate = computeComplianceRate(companyId, totalWorkers);

                long epiPending = epiDeliveryRepository.countByCompanyIdAndStatus(companyId, DeliveryStatus.PENDING);
                long epiDelivered = epiDeliveryRepository.countByCompanyIdAndStatus(companyId,
                                DeliveryStatus.DELIVERED);
                long epiConfirmed = epiDeliveryRepository.countByCompanyIdAndStatus(companyId,
                                DeliveryStatus.CONFIRMED);

                long incOpen = incidentRepository.countByCompany_IdAndStatus(companyId, IncidentStatus.OPEN);
                long incInProgress = incidentRepository.countByCompany_IdAndStatus(companyId,
                                IncidentStatus.IN_PROGRESS);
                long incCritical = incidentRepository
                                .findByCompany_IdAndSeverity(companyId, IncidentSeverity.CRITICAL).size();

                YearMonth currentMonth = YearMonth.now();
                LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
                LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);
                long incResolvedThisMonth = incidentRepository
                                .findByCompany_IdAndStatus(companyId, IncidentStatus.RESOLVED).stream()
                                .filter(i -> i.getResolvedAt() != null
                                                && !i.getResolvedAt().isBefore(monthStart)
                                                && !i.getResolvedAt().isAfter(monthEnd))
                                .count();

                Long userId = securityUtils.getCurrentUser().getId();
                long unread = notificationRepository.countByUser_IdAndIsReadFalse(userId);

                return DashboardResponse.builder()
                                .totalWorkers(totalWorkers)
                                .totalManagers(totalManagers)
                                .activeUsers(activeUsers)
                                .totalDocumentsPendingReview(pendingReview)
                                .totalDocumentsExpired(expiredDocs)
                                .totalDocumentsExpiringSoon(expiringSoon)
                                .documentComplianceRate(complianceRate)
                                .totalEpiDeliveriesPending(epiPending)
                                .totalEpiDeliveriesDelivered(epiDelivered)
                                .totalEpiDeliveriesConfirmed(epiConfirmed)
                                .totalIncidentsOpen(incOpen)
                                .totalIncidentsInProgress(incInProgress)
                                .totalIncidentsCritical(incCritical)
                                .totalIncidentsResolvedThisMonth(incResolvedThisMonth)
                                .unreadNotifications(unread)
                                .build();
        }

        private long computeComplianceRate(Long companyId, long totalWorkers) {
                if (totalWorkers == 0) {
                        return 100L;
                }

                List<User> workers = userRepository.findByCompanyIdAndActiveTrue(companyId)
                                .stream()
                                .filter(u -> u.getRole() == Role.WORKER)
                                .toList();

                long compliantWorkers = 0L;
                for (User worker : workers) {
                        if (worker.getJobPosition() == null) {
                                compliantWorkers++;
                                continue;
                        }

                        long mandatory = positionDocumentReqRepository
                                        .findByJobPositionIdAndActiveTrue(worker.getJobPosition().getId())
                                        .stream()
                                        .filter(r -> r.isMandatory())
                                        .count();

                        if (mandatory == 0) {
                                compliantWorkers++;
                                continue;
                        }

                        List<WorkerDocument> docs = workerDocumentRepository.findByWorkerId(worker.getId());
                        long approved = docs.stream()
                                        .filter(d -> d.getStatus() == DocumentStatus.APPROVED)
                                        .map(d -> d.getDocumentType().getId())
                                        .distinct()
                                        .count();

                        if (approved >= mandatory) {
                                compliantWorkers++;
                        }
                }

                return (compliantWorkers * 100L) / totalWorkers;
        }
}
