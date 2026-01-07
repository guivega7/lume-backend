package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.model.Category;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return categoryRepository.findByUser(user);
    }

    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        category.setUser(user);
        
        // XSS Protection
        if (category.getName() != null) {
            category.setName(HtmlUtils.htmlEscape(category.getName()));
        }
        
        return categoryRepository.save(category);
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // XSS Protection
        if (categoryDetails.getName() != null) {
            category.setName(HtmlUtils.htmlEscape(categoryDetails.getName()));
        } else {
            category.setName(categoryDetails.getName());
        }

        category.setType(categoryDetails.getType());
        return categoryRepository.save(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        try {
            categoryRepository.delete(category);
        } catch (Exception e) {
            // Caso haja transações vinculadas, o banco lançará uma exceção de constraint
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete category with linked transactions");
        }
        
        return ResponseEntity.noContent().build();
    }
}
