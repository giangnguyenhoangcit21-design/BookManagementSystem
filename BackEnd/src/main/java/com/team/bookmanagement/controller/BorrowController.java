package com.team.bookmanagement.controller;

import com.team.bookmanagement.model.dto.response.BorrowRecordResponse;
import com.team.bookmanagement.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @PostMapping("/request/{bookId}")
    public ResponseEntity<?> requestBorrow(@PathVariable Long bookId, Principal principal) {
        try {
            BorrowRecordResponse response = borrowService.requestBorrow(bookId, principal.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<BorrowRecordResponse>> getMyBorrowHistory(Principal principal) {
        List<BorrowRecordResponse> history = borrowService.getMyBorrowHistory(principal.getName());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/all")
    public ResponseEntity<List<BorrowRecordResponse>> getAllBorrowRecords() {
        List<BorrowRecordResponse> records = borrowService.getAllBorrowRecords();
        return ResponseEntity.ok(records);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, 
                                            @RequestParam(required = false) Integer durationDays) {
        try {
            BorrowRecordResponse response = borrowService.approveRequest(id, durationDays);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        try {
            BorrowRecordResponse response = borrowService.rejectRequest(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            BorrowRecordResponse response = borrowService.returnBook(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
