package com.team.bookmanagement.service;

import com.team.bookmanagement.model.dto.request.ReviewCreateRequest;
import com.team.bookmanagement.model.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(ReviewCreateRequest request, String username);
    List<ReviewResponse> getReviewsByBookId(Long bookId);
    Double getAverageRatingByBookId(Long bookId);
    List<ReviewResponse> getAllReviews();
    void deleteReview(Long id);
}
