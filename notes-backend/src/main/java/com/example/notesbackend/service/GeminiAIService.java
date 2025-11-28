package com.example.notesbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiAIService {
    
    @Value("${gemini.api.key:}")
    private String apiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    
    public GeminiAIService() {
        this.restTemplate = new RestTemplate();
    }
    
    public String generateSummary(String extractedText, String language, String subject) throws Exception {
        // Validate API key
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.length() < 25) {
            throw new Exception("Invalid or missing Gemini API key. Please configure a valid API key.");
        }
        
        // Language prompts (same as your frontend)
        Map<String, String> languagePrompts = createLanguagePrompts();
        String prompt = buildPrompt(extractedText, language, subject, 
            languagePrompts.getOrDefault(language, languagePrompts.get("english")));
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = createRequestBody(prompt);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            String fullUrl = apiUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, Map.class);
            
            return extractSummaryFromResponse(response.getBody());
            
        } catch (Exception e) {
            throw new Exception("AI service error: " + e.getMessage());
        }
    }
    
    private Map<String, String> createLanguagePrompts() {
        Map<String, String> prompts = new HashMap<>();
        prompts.put("english", "Provide a comprehensive, continuous, and detailed narrative summary in English. Organize the content into distinct paragraphs, ensuring smooth transitions between topics.");
        prompts.put("kannada", "ಕನ್ನಡದಲ್ಲಿ ಸಮಗ್ರ, ನಿರಂತರ ಮತ್ತು ವಿವರವಾದ ನಿರೂಪಣಾ ಸಾರಾಂಶವನ್ನು ನೀಡಿ. ವಿಷಯಗಳ ನಡುವೆ ಸುಗಮ ಪರಿವರ್ತನೆಗಳನ್ನು ಖಾತ್ರಿಪಡಿಸಿಕೊಂಡು, ವಿಷಯವನ್ನು ವಿಭಿನ್ನ ಪ್ಯಾರಾಗಳಾಗಿ ಆಯೋಜಿಸಿ.");
        prompts.put("hindi", "हिंदी में एक व्यापक, निरंतर और विस्तृत कथात्मक सारांश प्रदान करें। सामग्री को अलग-अलग पैराग्राफों में व्यवस्थित करें, विषयों के बीच सहज संक्रमण सुनिश्चित करें।");
        prompts.put("spanish", "Proporcione un resumen narrativo completo, continuo y detallado en español. Organice el contenido en párrafos distintos, asegurando transiciones fluidas entre temas.");
        prompts.put("french", "Fournissez un résumé narratif complet, continu et détaillé en français. Organisez le contenu en paragraphes distincts, assurant des transitions fluides entre les sujets.");
        prompts.put("german", "Geben Sie eine umfassende, kontinuierliche und detaillierte erzählende Zusammenfassung auf Deutsch. Gliedern Sie den Inhalt in verschiedene Absätze, um fließende Übergänge zwischen den Themen zu gewährleisten.");
        return prompts;
    }
    
    private String buildPrompt(String extractedText, String language, String subject, String languagePrompt) {
        return String.format(
            "You are an expert academic assistant specializing in summarizing handwritten student notes.\n" +
            "Your task is to analyze the raw, extracted text from a set of notes, which are related to the subject: **%s**,\n" +
            "and deliver a professional, highly detailed, and comprehensive narrative summary in **%s**.\n\n" +
            "### Key Requirements for the Summary:\n\n" +
            "1. **Structure and Format:** The summary MUST be provided in **continuous, distinct paragraph format**.\n" +
            "2. **Format Restriction:** **ABSOLUTELY DO NOT** use headings, bullet points (*), numbered lists, or any Markdown formatting other than basic paragraph breaks and **bolding/italics** for key terms if necessary.\n" +
            "3. **Content:** Focus on extracting the core academic information, definitions, formulas, key concepts, and relationships described, and present them in a coherent flow.\n" +
            "4. **Tone:** Maintain a clear, objective, and academic tone suitable for formal study material.\n\n" +
            "### Summary Instructions in %s:\n\n" +
            "%s\n\n" +
            "### Extracted Notes for Summarization:\n\n" +
            "```text\n" +
            "%s\n" +
            "```\n\n" +
            "Please begin the summary immediately below this instruction block. Do not include any introductory sentences or preamble before the first paragraph.",
            subject, language, language, languagePrompt, extractedText
        );
    }
    
    private Map<String, Object> createRequestBody(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        
        contents.put("parts", new Object[]{part});
        requestBody.put("contents", new Object[]{contents});
        return requestBody;
    }
    
    private String extractSummaryFromResponse(Map<String, Object> response) throws Exception {
        try {
            if (response.containsKey("candidates")) {
                java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    java.util.List<Map<String, Object>> parts = (java.util.List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            
            // Check for errors or blocked content
            if (response.containsKey("promptFeedback")) {
                Map<String, Object> feedback = (Map<String, Object>) response.get("promptFeedback");
                if (feedback.containsKey("blockReason")) {
                    throw new Exception("Content blocked by safety settings: " + feedback.get("blockReason"));
                }
            }
            
            throw new Exception("Unexpected response format from AI service");
            
        } catch (Exception e) {
            throw new Exception("Failed to parse AI response: " + e.getMessage());
        }
    }
}