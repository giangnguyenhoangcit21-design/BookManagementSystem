package com.team.bookmanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team.bookmanagement.model.dto.request.BookRequest;
import com.team.bookmanagement.model.dto.request.UserLoginRequest;
import com.team.bookmanagement.model.dto.request.UserRegisterRequest;
import com.team.bookmanagement.model.dto.response.BookResponse;
import com.team.bookmanagement.model.dto.response.JwtResponse;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class BookControllerIntegrationTests {

        @Autowired
        private MockMvc mockMvc;

        private final ObjectMapper objectMapper = new ObjectMapper();

        private static String userToken;
        private static String adminToken;
        private static Long createdBookId;

        @Test
        @Order(1)
        public void testUserRegistration() throws Exception {
                // Register regular user
                UserRegisterRequest userRequest = new UserRegisterRequest("testuser", "password123", "ROLE_USER");
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userRequest)))
                                .andExpect(status().isOk());

                // Register admin user
                UserRegisterRequest adminRequest = new UserRegisterRequest("testadmin", "password123", "ROLE_ADMIN");
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(adminRequest)))
                                .andExpect(status().isOk());
        }

        @Test
        @Order(2)
        public void testUserLogin() throws Exception {
                // Login regular user
                UserLoginRequest userLogin = new UserLoginRequest("testuser", "password123");
                MvcResult userResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userLogin)))
                                .andExpect(status().isOk())
                                .andReturn();

                String userResponseString = userResult.getResponse().getContentAsString();
                JwtResponse userJwt = objectMapper.readValue(userResponseString, JwtResponse.class);
                assertNotNull(userJwt.getToken());
                userToken = "Bearer " + userJwt.getToken();

                // Login admin user
                UserLoginRequest adminLogin = new UserLoginRequest("testadmin", "password123");
                MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(adminLogin)))
                                .andExpect(status().isOk())
                                .andReturn();

                String adminResponseString = adminResult.getResponse().getContentAsString();
                JwtResponse adminJwt = objectMapper.readValue(adminResponseString, JwtResponse.class);
                assertNotNull(adminJwt.getToken());
                adminToken = "Bearer " + adminJwt.getToken();
        }

        @Test
        @Order(3)
        public void testGetBooksWithoutToken() throws Exception {
                mockMvc.perform(get("/api/books"))
                                .andExpect(status().isForbidden());
        }

        @Test
        @Order(4)
        public void testCreateBook() throws Exception {
                BookRequest bookRequest = new BookRequest("Sách Test 1", "Tác Giả A", new BigDecimal("99000.00"),
                                "Mô tả sách test");

                MvcResult result = mockMvc.perform(post("/api/books")
                                .header("Authorization", userToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(bookRequest)))
                                .andExpect(status().isOk())
                                .andReturn();

                String responseString = result.getResponse().getContentAsString();
                BookResponse bookResponse = objectMapper.readValue(responseString, BookResponse.class);
                assertNotNull(bookResponse.getId());
                assertEquals("Sách Test 1", bookResponse.getTitle());
                assertEquals("testuser", bookResponse.getCreatedBy().getUsername());
                createdBookId = bookResponse.getId();
        }

        @Test
        @Order(5)
        public void testGetBooks() throws Exception {
                mockMvc.perform(get("/api/books")
                                .header("Authorization", userToken))
                                .andExpect(status().isOk());
        }

        @Test
        @Order(6)
        public void testUpdateBookByOwner() throws Exception {
                BookRequest updateRequest = new BookRequest("Sách Test 1 Update", "Tác Giả A",
                                new BigDecimal("120000.00"), "Mô tả sách test updated");

                mockMvc.perform(put("/api/books/" + createdBookId)
                                .header("Authorization", userToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk());
        }

        @Test
        @Order(7)
        public void testUpdateBookByNonOwnerWithoutAdmin() throws Exception {
                // Register and login another regular user
                UserRegisterRequest otherUser = new UserRegisterRequest("otheruser", "password123", "ROLE_USER");
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(otherUser)))
                                .andExpect(status().isOk());

                UserLoginRequest otherLogin = new UserLoginRequest("otheruser", "password123");
                MvcResult otherResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(otherLogin)))
                                .andExpect(status().isOk())
                                .andReturn();

                String otherResponseString = otherResult.getResponse().getContentAsString();
                JwtResponse otherJwt = objectMapper.readValue(otherResponseString, JwtResponse.class);
                String otherToken = "Bearer " + otherJwt.getToken();

                // Try to update testuser's book with otheruser's token -> should fail
                BookRequest updateRequest = new BookRequest("Sách Test 1 Update Bad", "Tác Giả A",
                                new BigDecimal("120000.00"), "Should not work");
                mockMvc.perform(put("/api/books/" + createdBookId)
                                .header("Authorization", otherToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @Order(8)
        public void testUpdateBookByAdmin() throws Exception {
                BookRequest updateRequest = new BookRequest("Sách Test 1 Update Admin", "Tác Giả A",
                                new BigDecimal("130000.00"), "Updated by admin");

                mockMvc.perform(put("/api/books/" + createdBookId)
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk());
        }

        @Test
        @Order(9)
        public void testDeleteBookByAdmin() throws Exception {
                // Delete using admin token -> should succeed
                mockMvc.perform(delete("/api/books/" + createdBookId)
                                .header("Authorization", adminToken))
                                .andExpect(status().isOk());
        }
}
