package com.prl.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "epi_delivery_confirms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpiDeliveryConfirm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "epi_delivery_id")
    private EpiDelivery epiDelivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private User worker;

    @Column(nullable = false)
    private LocalDateTime confirmedAt;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private String confirmationHash;
}
