package com.team.bookmanagement.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponseDTO {
    private Long id;
    private Long bookId;
    private String username;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
