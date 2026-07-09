package com.team.bookmanagement.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 100)
    private String category;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) FROM reviews r WHERE r.book_id = id)")
    private Double averageRating;

    @org.hibernate.annotations.Formula("(CASE WHEN EXISTS (SELECT 1 FROM borrow_records br WHERE br.book_id = id AND br.status IN ('PENDING', 'APPROVED')) THEN 0 ELSE 1 END)")
    private Integer availableInt;

    public boolean isAvailable() {
        return availableInt != null && availableInt == 1;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private User createdBy;
}
