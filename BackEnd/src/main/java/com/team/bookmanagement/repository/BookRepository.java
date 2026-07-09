package com.team.bookmanagement.repository;

import com.team.bookmanagement.model.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    @Query("SELECT DISTINCT b.category FROM Book b WHERE b.category IS NOT NULL")
    List<String> findDistinctCategories();
}
