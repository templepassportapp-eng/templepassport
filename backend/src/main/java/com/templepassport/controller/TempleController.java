package com.templepassport.controller;

import com.templepassport.model.Temple;
import com.templepassport.repository.TempleRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/temples")
@CrossOrigin
public class TempleController {

    private final TempleRepository templeRepo;

    public TempleController(TempleRepository templeRepo) {
        this.templeRepo = templeRepo;
    }

    @GetMapping
    public List<Temple> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String category) {
        if (q == null && state == null && category == null) {
            return templeRepo.findAll(Sort.by("name"));
        }
        return templeRepo.search(q, state, category);
    }

    @GetMapping("/search")
    public List<Temple> search(@RequestParam String q) {
        return templeRepo.search(q, null, null);
    }

    @GetMapping("/{id}")
    public Temple getById(@PathVariable UUID id) {
        return templeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Temple not found: " + id));
    }
}
