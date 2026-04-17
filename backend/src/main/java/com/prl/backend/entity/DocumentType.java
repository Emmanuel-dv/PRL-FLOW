package com.prl.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    private String name;

    private Integer validityDays;

    @Column(nullable = false)
    @Builder.Default
    private boolean requiresExpiry = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
