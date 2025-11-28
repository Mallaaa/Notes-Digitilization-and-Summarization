package com.example.notesbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SummaryResponse {
    private boolean success;
    private String summary;
    private String error;
    
    // Constructors
    public SummaryResponse() {}
    
    public SummaryResponse(boolean success, String summary) {
        this.success = success;
        this.summary = summary;
    }
    
 
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}