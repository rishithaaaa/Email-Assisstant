package com.mamidi.email_writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {
    private WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @PostConstruct
    public void setup(){
        System.out.println("Initializing the gemini url: "+geminiApiUrl);
        System.out.println("Initializing the gemini api: "+geminiApiKey);
    }

    private final Logger logger = LoggerFactory.getLogger(EmailGeneratorService.class);

    public EmailGeneratorService(WebClient.Builder webClientBuilder){
        this.webClient = webClientBuilder.build();
    }
    public String generateEmail(EmailRequest emailRequest){

//        logger.info(String.valueOf(emailRequest));
        //build prompt
        String prompt = buildPrompt(emailRequest);

        //craft a request in the format for the prompt
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of(
                                                "text", prompt
                                        )
                                }
                        )
        }
        );
        String response = null;
        try{
            // do req and return extracted response
             response = webClient.post()
                    .uri(geminiApiUrl + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        }catch(Exception e){
            e.printStackTrace();
            logger.info("Error in creating response body "+ e.getMessage());
        }






    return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        logger.info(response);
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        }catch (Exception e){
            return "Error processing request: "+ e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please don't generate a subject line and provide only one response. ");
        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());


        return prompt.toString();
    }
}
