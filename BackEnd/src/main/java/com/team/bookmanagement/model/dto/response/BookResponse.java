package com.team.bookmanagement.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private BigDecimal price;
    private String description;
    private String category;
    private boolean available;
    private Double averageRating;
    private UserResponse createdBy;
}
