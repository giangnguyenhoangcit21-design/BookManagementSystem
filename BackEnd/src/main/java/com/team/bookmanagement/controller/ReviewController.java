package com.team.bookmanagement.controller;

import com.team.bookmanagement.model.dto.request.ReviewCreateRequest;
import com.team.bookmanagement.model.dto.response.ReviewResponse;
import com.team.bookmanagement.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @Valid @RequestBody ReviewCreateRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        ReviewResponse response = reviewService.addReview(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByBookId(@PathVariable Long bookId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByBookId(bookId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/book/{bookId}/average")
    public ResponseEntity<Double> getAverageRatingByBookId(@PathVariable Long bookId) {
        Double avgRating = reviewService.getAverageRatingByBookId(bookId);
        return ResponseEntity.ok(avgRating);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}
