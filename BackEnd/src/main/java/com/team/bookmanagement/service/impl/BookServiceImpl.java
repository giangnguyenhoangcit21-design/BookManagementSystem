package com.team.bookmanagement.service.impl;

import com.team.bookmanagement.model.dto.request.BookRequest;
import com.team.bookmanagement.model.dto.response.BookResponse;
import com.team.bookmanagement.model.dto.response.UserResponse;
import com.team.bookmanagement.model.entity.Book;
import com.team.bookmanagement.model.entity.User;
import com.team.bookmanagement.repository.BookRepository;
import com.team.bookmanagement.repository.UserRepository;
import com.team.bookmanagement.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        return convertToResponse(book);
    }

    @Override
    @Transactional
    public BookResponse createBook(BookRequest request, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        if (request.getPrice() == null || request.getPrice().doubleValue() < 0) {
            throw new RuntimeException("Price must be greater than or equal to 0");
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .price(request.getPrice())
                .description(request.getDescription())
                .createdBy(currentUser)
                .build();

        Book savedBook = bookRepository.save(book);
        return convertToResponse(savedBook);
    }

    @Override
    @Transactional
    public BookResponse updateBook(Long id, BookRequest request, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        // Check ownership or admin status
        boolean isOwner = book.getCreatedBy() != null && book.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Access Denied: You do not have permission to update this book.");
        }

        if (request.getPrice() == null || request.getPrice().doubleValue() < 0) {
            throw new RuntimeException("Price must be greater than or equal to 0");
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPrice(request.getPrice());
        book.setDescription(request.getDescription());

        Book updatedBook = bookRepository.save(book);
        return convertToResponse(updatedBook);
    }

    @Override
    @Transactional
    public void deleteBook(Long id, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        // Check ownership or admin status
        boolean isOwner = book.getCreatedBy() != null && book.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Access Denied: You do not have permission to delete this book.");
        }

        bookRepository.delete(book);
    }

    private BookResponse convertToResponse(Book book) {
        UserResponse creator = null;
        if (book.getCreatedBy() != null) {
            creator = UserResponse.builder()
                    .id(book.getCreatedBy().getId())
                    .username(book.getCreatedBy().getUsername())
                    .role(book.getCreatedBy().getRole())
                    .build();
        }
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .price(book.getPrice())
                .description(book.getDescription())
                .createdBy(creator)
                .build();
    }
}
