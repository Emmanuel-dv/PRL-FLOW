package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateEpiDeliveryRequest;
import com.prl.backend.dto.request.DeliveryItemRequest;
import com.prl.backend.dto.response.EpiDeliveryConfirmResponse;
import com.prl.backend.dto.response.EpiDeliveryItemResponse;
import com.prl.backend.dto.response.EpiDeliveryResponse;
import com.prl.backend.entity.*;
import com.prl.backend.entity.enums.DeliveryStatus;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.mapper.EpiDeliveryConfirmMapper;
import com.prl.backend.mapper.EpiDeliveryItemMapper;
import com.prl.backend.mapper.EpiDeliveryMapper;
import com.prl.backend.repository.*;
import com.prl.backend.security.HashUtils;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.EpiDeliveryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EpiDeliveryServiceImpl implements EpiDeliveryService {

    private final EpiDeliveryRepository epiDeliveryRepository;
    private final EpiDeliveryItemRepository epiDeliveryItemRepository;
    private final EpiDeliveryConfirmRepository epiDeliveryConfirmRepository;
    private final UserRepository userRepository;
    private final EpiCatalogRepository epiCatalogRepository;
    private final EpiDeliveryMapper epiDeliveryMapper;
    private final EpiDeliveryItemMapper epiDeliveryItemMapper;
    private final EpiDeliveryConfirmMapper epiDeliveryConfirmMapper;
    private final SecurityUtils securityUtils;
    private final HashUtils hashUtils;

    @Override
    public EpiDeliveryResponse create(CreateEpiDeliveryRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Solo un MANAGER puede crear entregas de EPIs.");
        }

        User worker = userRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Trabajador no encontrado: " + request.getWorkerId()));

        if (!worker.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("El trabajador no pertenece a su empresa.");
        }

        EpiDelivery delivery = EpiDelivery.builder()
                .company(currentUser.getCompany())
                .manager(currentUser)
                .worker(worker)
                .notes(request.getNotes())
                .build();

        delivery = epiDeliveryRepository.save(delivery);

        List<EpiDeliveryItem> items = new ArrayList<>();
        for (DeliveryItemRequest itemReq : request.getItems()) {
            EpiCatalog epiCatalog = epiCatalogRepository.findById(itemReq.getEpiCatalogId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "EPI no encontrado: " + itemReq.getEpiCatalogId()));

            if (!epiCatalog.getCompany().getId().equals(currentUser.getCompany().getId())) {
                throw new IllegalArgumentException(
                        "El EPI '" + epiCatalog.getName() + "' no pertenece a su empresa.");
            }

            EpiDeliveryItem item = EpiDeliveryItem.builder()
                    .epiDelivery(delivery)
                    .epiCatalog(epiCatalog)
                    .quantity(itemReq.getQuantity())
                    .build();

            items.add(item);
        }

        epiDeliveryItemRepository.saveAll(items);

        return enrichResponse(delivery, items, null);
    }

    @Override
    @Transactional(readOnly = true)
    public EpiDeliveryResponse getById(Long id) {
        EpiDelivery delivery = findOwnedDelivery(id);
        return enrichResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EpiDeliveryResponse> getMyDeliveries() {
        User currentUser = securityUtils.getCurrentUser();

        List<EpiDelivery> deliveries;
        if (currentUser.getRole() == Role.WORKER) {
            deliveries = epiDeliveryRepository
                    .findByWorkerIdOrderByOpenedAtDesc(currentUser.getId());
        } else {
            deliveries = epiDeliveryRepository
                    .findByManagerIdOrderByOpenedAtDesc(currentUser.getId());
        }

        return epiDeliveryMapper.toResponseList(deliveries);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EpiDeliveryResponse> getByWorker(Long workerId) {
        User currentUser = securityUtils.getCurrentUser();

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Trabajador no encontrado: " + workerId));

        if (!worker.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new IllegalArgumentException("El trabajador no pertenece a su empresa.");
        }

        return epiDeliveryMapper.toResponseList(
                epiDeliveryRepository.findByWorkerIdOrderByOpenedAtDesc(workerId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EpiDeliveryResponse> getByCompany() {
        Long companyId = securityUtils.getCurrentCompanyId();
        return epiDeliveryMapper.toResponseList(
                epiDeliveryRepository.findByCompanyIdOrderByOpenedAtDesc(companyId));
    }

    @Override
    public EpiDeliveryResponse markAsDelivered(Long id) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Solo un MANAGER puede marcar entregas.");
        }

        EpiDelivery delivery = findOwnedDelivery(id);

        if (!delivery.getManager().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Solo el manager que creó la entrega puede marcarla.");
        }

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalStateException(
                    "Solo se pueden marcar como entregadas las entregas en estado PENDING.");
        }

        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setDeliveredAt(LocalDateTime.now());
        delivery = epiDeliveryRepository.save(delivery);

        return enrichResponse(delivery);
    }

    @Override
    public EpiDeliveryResponse confirmReception(Long id, HttpServletRequest httpRequest) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() != Role.WORKER) {
            throw new IllegalArgumentException("Solo un WORKER puede confirmar la recepción.");
        }

        EpiDelivery delivery = findOwnedDelivery(id);

        if (!delivery.getWorker().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Solo el trabajador destinatario puede confirmar.");
        }

        if (delivery.getStatus() != DeliveryStatus.DELIVERED) {
            throw new IllegalStateException(
                    "Solo se pueden confirmar entregas en estado DELIVERED.");
        }

        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null) {
            ip = httpRequest.getRemoteAddr();
        }

        LocalDateTime confirmedAt = LocalDateTime.now();

        String hash = hashUtils.generateConfirmationHash(
                delivery.getId(), currentUser.getId(), confirmedAt);

        EpiDeliveryConfirm confirm = EpiDeliveryConfirm.builder()
                .epiDelivery(delivery)
                .worker(currentUser)
                .confirmedAt(confirmedAt)
                .ipAddress(ip)
                .confirmationHash(hash)
                .build();

        epiDeliveryConfirmRepository.save(confirm);

        delivery.setStatus(DeliveryStatus.CONFIRMED);
        delivery = epiDeliveryRepository.save(delivery);

        return enrichResponse(delivery, null, confirm);
    }

    private EpiDelivery findOwnedDelivery(Long id) {
        Long companyId = securityUtils.getCurrentCompanyId();
        EpiDelivery delivery = epiDeliveryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Entrega no encontrada: " + id));
        if (!delivery.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("La entrega no pertenece a su empresa.");
        }
        return delivery;
    }

    private EpiDeliveryResponse enrichResponse(EpiDelivery delivery) {
        List<EpiDeliveryItem> items =
                epiDeliveryItemRepository.findByEpiDeliveryId(delivery.getId());
        EpiDeliveryConfirm confirm =
                epiDeliveryConfirmRepository.findByEpiDeliveryId(delivery.getId())
                        .orElse(null);
        return enrichResponse(delivery, items, confirm);
    }

    private EpiDeliveryResponse enrichResponse(
            EpiDelivery delivery,
            List<EpiDeliveryItem> items,
            EpiDeliveryConfirm confirm) {

        EpiDeliveryResponse response = epiDeliveryMapper.toResponse(delivery);

        if (items == null) {
            items = epiDeliveryItemRepository.findByEpiDeliveryId(delivery.getId());
        }
        List<EpiDeliveryItemResponse> itemResponses =
                epiDeliveryItemMapper.toResponseList(items);
        response.setItems(itemResponses);

        if (confirm == null) {
            confirm = epiDeliveryConfirmRepository
                    .findByEpiDeliveryId(delivery.getId()).orElse(null);
        }
        if (confirm != null) {
            EpiDeliveryConfirmResponse confirmResponse =
                    epiDeliveryConfirmMapper.toResponse(confirm);
            response.setConfirmation(confirmResponse);
        }

        return response;
    }
}
