package com.prl.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "epi_catalog")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpiCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    private String name;

    private String referenceCode;

    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
