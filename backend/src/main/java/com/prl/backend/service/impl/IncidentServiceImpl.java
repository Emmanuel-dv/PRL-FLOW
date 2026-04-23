package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateIncidentRequest;
import com.prl.backend.dto.request.UpdateIncidentStatusRequest;
import com.prl.backend.dto.response.IncidentResponse;
import com.prl.backend.entity.Incident;
import com.prl.backend.entity.IncidentStatusLog;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.IncidentStatus;
import com.prl.backend.entity.enums.NotificationType;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.mapper.IncidentMapper;
import com.prl.backend.mapper.IncidentStatusLogMapper;
import com.prl.backend.repository.IncidentRepository;
import com.prl.backend.repository.IncidentStatusLogRepository;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.IncidentService;
import com.prl.backend.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentStatusLogRepository statusLogRepository;
    private final UserRepository userRepository;
    private final IncidentMapper incidentMapper;
    private final IncidentStatusLogMapper statusLogMapper;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Override
    public IncidentResponse create(CreateIncidentRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Incident incident = Incident.builder()
                .company(currentUser.getCompany())
                .reportedBy(currentUser)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .severity(request.getSeverity())
                .location(request.getLocation())
                .status(IncidentStatus.OPEN)
                .build();

        incident = incidentRepository.save(incident);

        IncidentStatusLog log = IncidentStatusLog.builder()
                .incident(incident)
                .changedBy(currentUser)
                .oldStatus(null)
                .newStatus(IncidentStatus.OPEN)
                .comment("Incidencia creada")
                .build();

        statusLogRepository.save(log);

        Long companyId = currentUser.getCompany().getId();
        List<User> admins = userRepository.findByCompany_IdAndRole(companyId, Role.ADMIN);
        admins.forEach(admin -> notificationService.create(
                admin,
                NotificationType.INCIDENT_CREATED,
                "Nueva incidencia reportada",
                incident.getSeverity().name() + ": " + incident.getTitle(),
                "INCIDENT", incident.getId()));

        return enrichResponse(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentResponse getById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Incidencia no encontrada: " + id));

        if (!incident.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("La incidencia no pertenece a su empresa.");
        }

        return enrichResponse(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponse> getMyIncidents() {
        User currentUser = securityUtils.getCurrentUser();
        List<Incident> incidents;

        if (currentUser.getRole() == Role.WORKER) {
            incidents = incidentRepository.findByReportedBy_IdOrderByCreatedAtDesc(currentUser.getId());
        } else if (currentUser.getRole() == Role.MANAGER) {
            incidents = incidentRepository.findByAssignedTo_IdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            incidents = incidentRepository.findByCompany_IdOrderByCreatedAtDesc(currentUser.getCompany().getId());
        }

        return incidents.stream()
                .map(this::enrichResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponse> getByCompany() {
        Long companyId = securityUtils.getCurrentCompanyId();
        return incidentRepository.findByCompany_IdOrderByCreatedAtDesc(companyId).stream()
                .map(this::enrichResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponse> getByStatus(IncidentStatus status) {
        Long companyId = securityUtils.getCurrentCompanyId();
        return incidentRepository.findByCompany_IdAndStatus(companyId, status).stream()
                .map(this::enrichResponse)
                .collect(Collectors.toList());
    }

    @Override
    public IncidentResponse updateStatus(Long id, UpdateIncidentStatusRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Solo ADMIN o MANAGER pueden cambiar el estado de una incidencia.");
        }

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Incidencia no encontrada: " + id));

        if (!incident.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("La incidencia no pertenece a su empresa.");
        }

        IncidentStatus oldStatus = incident.getStatus();

        incident.setStatus(request.getNewStatus());

        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Usuario no encontrado: " + request.getAssignedToId()));
            incident.setAssignedTo(assignedTo);
        }

        if (request.getNewStatus() == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        incident = incidentRepository.save(incident);

        if (request.getAssignedToId() != null && incident.getAssignedTo() != null) {
            notificationService.create(
                    incident.getAssignedTo(),
                    NotificationType.INCIDENT_ASSIGNED,
                    "Incidencia asignada a ti",
                    "Se te ha asignado la incidencia: " + incident.getTitle(),
                    "INCIDENT", incident.getId());
        }

        IncidentStatusLog log = IncidentStatusLog.builder()
                .incident(incident)
                .changedBy(currentUser)
                .oldStatus(oldStatus)
                .newStatus(request.getNewStatus())
                .comment(request.getComment())
                .build();

        statusLogRepository.save(log);

        return enrichResponse(incident);
    }

    private IncidentResponse enrichResponse(Incident incident) {
        IncidentResponse response = incidentMapper.toResponse(incident);
        response.setStatusHistory(
                statusLogMapper.toResponseList(
                        statusLogRepository.findByIncident_IdOrderByChangedAtAsc(incident.getId())));
        return response;
    }
}
