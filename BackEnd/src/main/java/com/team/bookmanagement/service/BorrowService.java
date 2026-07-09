package com.team.bookmanagement.service;

import com.team.bookmanagement.model.dto.response.BorrowRecordResponse;
import java.util.List;
import java.util.Map;

public interface BorrowService {
    BorrowRecordResponse requestBorrow(Long bookId, String username);
    Map<Long, String> getMyActiveBorrowStatus(String username);
    List<BorrowRecordResponse> getMyBorrowHistory(String username);
    List<BorrowRecordResponse> getAllBorrowRecords();
    BorrowRecordResponse approveRequest(Long recordId, Integer durationDays);
    BorrowRecordResponse rejectRequest(Long recordId);
    BorrowRecordResponse returnBook(Long recordId);
}
