package com.team.bookmanagement.service.impl;

import com.team.bookmanagement.model.dto.response.BorrowRecordResponse;
import com.team.bookmanagement.model.entity.Book;
import com.team.bookmanagement.model.entity.BorrowRecord;
import com.team.bookmanagement.model.entity.User;
import com.team.bookmanagement.repository.BookRepository;
import com.team.bookmanagement.repository.BorrowRecordRepository;
import com.team.bookmanagement.repository.UserRepository;
import com.team.bookmanagement.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowServiceImpl implements BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public BorrowRecordResponse requestBorrow(Long bookId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        // Check if book is already borrowed or pending approval
        boolean alreadyBorrowed = borrowRecordRepository.existsByBookIdAndStatusIn(
                bookId, List.of("PENDING", "APPROVED"));
        if (alreadyBorrowed) {
            throw new RuntimeException("Book is already requested or borrowed");
        }

        BorrowRecord record = BorrowRecord.builder()
                .user(user)
                .book(book)
                .status("PENDING")
                .requestDate(LocalDateTime.now())
                .build();

        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        return convertToResponse(savedRecord);
    }

    @Override
    public List<BorrowRecordResponse> getMyBorrowHistory(String username) {
        return borrowRecordRepository.findByUserUsernameOrderByRequestDateDesc(username).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BorrowRecordResponse> getAllBorrowRecords() {
        return borrowRecordRepository.findAllByOrderByRequestDateDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BorrowRecordResponse approveRequest(Long recordId, Integer durationDays) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + recordId));

        if (!"PENDING".equals(record.getStatus())) {
            throw new RuntimeException("Only PENDING requests can be approved");
        }

        int days = durationDays != null ? durationDays : 14;
        LocalDateTime now = LocalDateTime.now();

        record.setStatus("APPROVED");
        record.setBorrowDate(now);
        record.setDueDate(now.plusDays(days));

        BorrowRecord updatedRecord = borrowRecordRepository.save(record);
        return convertToResponse(updatedRecord);
    }

    @Override
    @Transactional
    public BorrowRecordResponse rejectRequest(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + recordId));

        if (!"PENDING".equals(record.getStatus())) {
            throw new RuntimeException("Only PENDING requests can be rejected");
        }

        record.setStatus("REJECTED");

        BorrowRecord updatedRecord = borrowRecordRepository.save(record);
        return convertToResponse(updatedRecord);
    }

    @Override
    @Transactional
    public BorrowRecordResponse returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + recordId));

        if (!"APPROVED".equals(record.getStatus())) {
            throw new RuntimeException("Only APPROVED records can be returned");
        }

        record.setStatus("RETURNED");
        record.setReturnDate(LocalDateTime.now());

        BorrowRecord updatedRecord = borrowRecordRepository.save(record);
        return convertToResponse(updatedRecord);
    }

    private BorrowRecordResponse convertToResponse(BorrowRecord record) {
        Long daysRemaining = 0L;
        Boolean isOverdue = false;
        LocalDateTime now = LocalDateTime.now();

        if ("APPROVED".equals(record.getStatus()) && record.getDueDate() != null) {
            if (record.getReturnDate() == null) {
                daysRemaining = ChronoUnit.DAYS.between(now, record.getDueDate());
                isOverdue = now.isAfter(record.getDueDate());
            } else {
                daysRemaining = 0L;
                isOverdue = record.getReturnDate().isAfter(record.getDueDate());
            }
        }

        return BorrowRecordResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .username(record.getUser().getUsername())
                .bookId(record.getBook().getId())
                .bookTitle(record.getBook().getTitle())
                .status(record.getStatus())
                .requestDate(record.getRequestDate())
                .borrowDate(record.getBorrowDate())
                .dueDate(record.getDueDate())
                .returnDate(record.getReturnDate())
                .daysRemaining(daysRemaining)
                .isOverdue(isOverdue)
                .build();
    }
}
