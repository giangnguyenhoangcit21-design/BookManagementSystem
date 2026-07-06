package com.team.bookmanagement.controller;

import com.team.bookmanagement.model.dto.ReviewRequestDTO;
import com.team.bookmanagement.model.dto.ReviewResponseDTO;
import com.team.bookmanagement.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> addReview(
            Authentication authentication,
            @RequestBody ReviewRequestDTO request) {
        try {
            String username = authentication.getName();
            ReviewResponseDTO response = reviewService.addReview(username, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByBookId(@PathVariable Long bookId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByBookId(bookId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/book/{bookId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long bookId) {
        Double avgRating = reviewService.getAverageRating(bookId);
        return ResponseEntity.ok(avgRating);
    }
}
