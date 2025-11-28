package com.example.notesbackend.controller;

import com.example.notesbackend.dto.SummaryRequest;
import com.example.notesbackend.dto.SummaryResponse;
import com.example.notesbackend.service.GeminiAIService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") // Configure for your frontend URL in production
public class NotesController {
    
    private final GeminiAIService aiService;
    
    public NotesController(GeminiAIService aiService) {
        this.aiService = aiService;
    }
    
    @PostMapping("/summarize")
    public ResponseEntity<SummaryResponse> summarizeNotes(@RequestBody SummaryRequest request) {
        try {
            // Validate input
            if (request.getExtractedText() == null || request.getExtractedText().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new SummaryResponse(false, "Extracted text cannot be empty"));
            }
            
            if (request.getLanguage() == null || request.getSubject() == null) {
                return ResponseEntity.badRequest()
                    .body(new SummaryResponse(false, "Language and subject are required"));
            }
            
            // Generate summary using AI
            String summary = aiService.generateSummary(
                request.getExtractedText(), 
                request.getLanguage(), 
                request.getSubject()
            );
            
            SummaryResponse response = new SummaryResponse(true, summary);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            SummaryResponse response = new SummaryResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Notes Backend is running!");
    }
}