package com.team.bookmanagement.service;

import com.team.bookmanagement.model.dto.ReviewRequestDTO;
import com.team.bookmanagement.model.dto.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    ReviewResponseDTO addReview(String username, ReviewRequestDTO request);
    List<ReviewResponseDTO> getReviewsByBookId(Long bookId);
    Double getAverageRating(Long bookId);
}
