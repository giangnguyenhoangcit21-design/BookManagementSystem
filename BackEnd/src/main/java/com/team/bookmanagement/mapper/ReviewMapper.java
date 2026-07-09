package com.team.bookmanagement.mapper;

import com.team.bookmanagement.model.dto.request.ReviewCreateRequest;
import com.team.bookmanagement.model.dto.response.ReviewResponse;
import com.team.bookmanagement.model.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "book", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Review toEntity(ReviewCreateRequest request);

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "username", source = "user.username")
    ReviewResponse toResponse(Review review);
}
