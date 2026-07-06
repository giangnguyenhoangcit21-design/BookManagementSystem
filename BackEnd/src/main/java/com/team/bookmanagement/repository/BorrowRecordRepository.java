package com.team.bookmanagement.repository;

import com.team.bookmanagement.model.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUserUsernameOrderByRequestDateDesc(String username);
    List<BorrowRecord> findAllByOrderByRequestDateDesc();
    boolean existsByBookIdAndStatusIn(Long bookId, Collection<String> statuses);
}
