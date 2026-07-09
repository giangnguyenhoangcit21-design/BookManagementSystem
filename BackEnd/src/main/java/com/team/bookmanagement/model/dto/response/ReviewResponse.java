package com.team.bookmanagement.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long bookId;
    private String username;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
