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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    private Specification<Book> buildSpecification(String search, String category, Boolean availableOnly) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.trim() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(root.get("title"), likePattern),
                    criteriaBuilder.like(root.get("author"), likePattern)
                ));
            }
            
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category.trim()));
            }
            
            if (availableOnly != null && availableOnly) {
                predicates.add(criteriaBuilder.equal(root.get("availableInt"), 1));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    public Page<BookResponse> getAllBooks(String search, String category, Boolean availableOnly, Pageable pageable) {
        Specification<Book> spec = buildSpecification(search, category, availableOnly);
        Page<Book> books = bookRepository.findAll(spec, pageable);
        return books.map(this::convertToResponse);
    }

    @Override
    public List<String> getAllCategories() {
        return bookRepository.findDistinctCategories();
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
                .category(request.getCategory())
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
        book.setCategory(request.getCategory());

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
                .category(book.getCategory())
                .averageRating(book.getAverageRating())
                .available(book.isAvailable())
                .createdBy(creator)
                .build();
    }
}
