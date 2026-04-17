package com.prl.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "epi_delivery_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpiDeliveryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "epi_delivery_id")
    private EpiDelivery epiDelivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "epi_catalog_id")
    private EpiCatalog epiCatalog;

    @Column(nullable = false)
    private Integer quantity;
}
