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

    private long totalWorkers;
    private long totalManagers;
    private long activeUsers;

    private long totalDocumentsPendingReview;
    private long totalDocumentsExpired;
    private long totalDocumentsExpiringSoon;
    private long documentComplianceRate;

    private long totalEpiDeliveriesPending;
    private long totalEpiDeliveriesDelivered;
    private long totalEpiDeliveriesConfirmed;
    private long totalIncidentsOpen;
    private long totalIncidentsInProgress;
    private long totalIncidentsCritical;
    private long totalIncidentsResolvedThisMonth;

    private long unreadNotifications;
}
