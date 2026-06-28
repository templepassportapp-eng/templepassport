package com.templepassport.controller;

import com.templepassport.dto.CheckInRequest;
import com.templepassport.dto.CheckInResponse;
import com.templepassport.service.CheckInService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkins")
@CrossOrigin
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CheckInResponse create(@RequestBody CheckInRequest req) {
        return checkInService.create(req);
    }
}
