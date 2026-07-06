package com.team.bookmanagement.model.dto;

import lombok.Data;

@Data
public class ReviewRequestDTO {
    private Long bookId;
    private Integer rating;
    private String comment;
}
