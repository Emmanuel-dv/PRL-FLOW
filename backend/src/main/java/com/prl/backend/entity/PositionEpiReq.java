package com.prl.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "position_epi_req",
        uniqueConstraints = @UniqueConstraint(columnNames = {"job_position_id", "epi_catalog_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionEpiReq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "epi_catalog_id")
    private EpiCatalog epiCatalog;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
