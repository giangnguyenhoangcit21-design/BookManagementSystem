package com.team.bookmanagement.service;

import com.team.bookmanagement.model.dto.request.BookRequest;
import com.team.bookmanagement.model.dto.response.BookResponse;
import java.util.List;

public interface BookService {
    List<BookResponse> getAllBooks();
    BookResponse getBookById(Long id);
    BookResponse createBook(BookRequest request, String currentUsername);
    BookResponse updateBook(Long id, BookRequest request, String currentUsername);
    void deleteBook(Long id, String currentUsername);
}
