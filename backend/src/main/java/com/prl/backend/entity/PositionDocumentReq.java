package com.prl.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "position_document_req",
        uniqueConstraints = @UniqueConstraint(columnNames = {"job_position_id", "document_type_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionDocumentReq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id")
    private DocumentType documentType;

    @Column(nullable = false)
    @Builder.Default
    private boolean mandatory = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
