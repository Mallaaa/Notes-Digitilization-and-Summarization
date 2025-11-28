package com.example.notesbackend.dto;

public class SummaryRequest {
    private String extractedText;
    private String language;
    private String subject;
    
    // Constructors
    public SummaryRequest() {}
    
    public SummaryRequest(String extractedText, String language, String subject) {
        this.extractedText = extractedText;
        this.language = language;
        this.subject = subject;
    }
    
    // Getters and Setters
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}