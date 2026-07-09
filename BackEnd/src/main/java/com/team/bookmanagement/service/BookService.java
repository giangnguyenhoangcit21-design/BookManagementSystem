package com.team.bookmanagement.service;

import com.team.bookmanagement.model.dto.request.BookRequest;
import com.team.bookmanagement.model.dto.response.BookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BookService {
    Page<BookResponse> getAllBooks(String search, String category, Boolean availableOnly, Pageable pageable);
    List<String> getAllCategories();
    BookResponse getBookById(Long id);
    BookResponse createBook(BookRequest request, String currentUsername);
    BookResponse updateBook(Long id, BookRequest request, String currentUsername);
    void deleteBook(Long id, String currentUsername);
}
