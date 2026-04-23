package com.prl.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    // Métricas de usuarios
    private long totalWorkers;
    private long totalManagers;
    private long activeUsers;

    // Métricas de documentación
    private long totalDocumentsPendingReview;
    private long totalDocumentsExpired;
    private long totalDocumentsExpiringSoon;
    private long documentComplianceRate;

    // Métricas de EPIs
    private long totalEpiDeliveriesPending;
    private long totalEpiDeliveriesDelivered;
    private long totalEpiDeliveriesConfirmed;

    // Métricas de incidencias
    private long totalIncidentsOpen;
    private long totalIncidentsInProgress;
    private long totalIncidentsCritical;
    private long totalIncidentsResolvedThisMonth;

    // Notificaciones
    private long unreadNotifications;
}
