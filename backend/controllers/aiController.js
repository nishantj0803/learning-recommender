// backend/controllers/aiController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Initialize with API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.6,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Helper function to classify user query
const classifyQueryType = async (query) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured on the server.");
    throw new Error('AI service is not configured correctly.');
  }

  // Simple heuristic check for common question patterns first
  const questionPatterns = [
    "what is", "what are", "how does", "explain", "define", "describe", 
    "why is", "why are", "can you tell me about", "tell me about",
    "difference between", "compare", "vs", "versus", "?", "meaning of"
  ];
  
  // Learning path keywords (only use if no question patterns are found)
  const learningPathKeywords = [
    "learning path", "roadmap", "path", "steps to", "become", "how to become", 
    "learn to be", "career path", "how do i get started", "journey to", "start learning",
    "how to learn", "how can i learn", "steps for learning", "guide to learning"
  ];
  
  // Check for question patterns first
  for (const pattern of questionPatterns) {
    if (query.toLowerCase().includes(pattern)) {
      console.log(`Query matched question pattern: "${pattern}"`);
      return "GENERAL_QUESTION";
    }
  }
  
  // Then check for learning path keywords
  for (const keyword of learningPathKeywords) {
    if (query.toLowerCase().includes(keyword)) {
      console.log(`Query matched learning path keyword: "${keyword}"`);
      return "LEARNING_PATH";
    }
  }

  // If no patterns match, use AI to classify more complex queries
  const classificationPrompt = `
    Analyze the following user query and determine if it is:
    1. A request for a learning path/roadmap/steps/guidance on how to learn something (LEARNING_PATH)
    2. A general question or doubt seeking an informational answer (GENERAL_QUESTION)

    Query: "${query}"
    
    IMPORTANT GUIDELINES:
    - If the query contains words like "what is", "explain", "define", "describe", classify as GENERAL_QUESTION
    - If the query ends with a question mark and asks for information rather than steps, classify as GENERAL_QUESTION
    - If the query is asking "how to learn" or "steps to become" something, classify as LEARNING_PATH
    - When in doubt, prefer GENERAL_QUESTION classification
    
    Respond with ONLY ONE of these exact labels: "LEARNING_PATH" or "GENERAL_QUESTION".
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig, safetySettings });
    const result = await model.generateContent(classificationPrompt);
    const response = await result.response;
    const classification = response.text().trim();
    
    console.log(`AI classification result: "${classification}"`);
    return classification.includes("LEARNING_PATH") ? "LEARNING_PATH" : "GENERAL_QUESTION";
  } catch (error) {
    console.error("Error classifying query:", error);
    // Default to GENERAL_QUESTION for safety
    return "GENERAL_QUESTION";
  }
};

// @desc    Generate a learning path or answer a question using Google Gemini AI
// @route   POST /api/ai/generate-path
// @access  Private
const generateAiLearningPath = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { query: userQuery } = req.body;

  if (!userQuery) {
    res.status(400);
    throw new Error('Please provide your question or learning goal.');
  }
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured on the server.");
    return res.status(500).json({ message: 'AI service is not configured correctly.' });
  }

  // Fetch user data
  const user = await User.findById(userId).select('interests goals name');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const userInterests = user.interests || [];
  const userGoals = user.goals || [];
  const userName = user.name || "User";
  
  try {
    // Classify the query to determine if it's a learning path request or a general question
    const queryType = await classifyQueryType(userQuery);
    console.log(`Query "${userQuery}" classified as: ${queryType}`);

    // Fetch course data for context
    const availableCourses = await Course.find({}).select('title category tags difficulty').lean();
    let courseContextForAI = "Our platform offers courses in categories such as: ";
    const uniqueCategories = [...new Set(availableCourses.map(c => c.category).filter(Boolean))];
    courseContextForAI += uniqueCategories.join(', ') + ". ";
    const sampleCourseTitles = availableCourses.slice(0, 3).map(c => c.title).join(', ');
    if (sampleCourseTitles) {
      courseContextForAI += `Example course titles include: ${sampleCourseTitles}. `;
    }
    courseContextForAI += "When suggesting a learning step that aligns with a course type we offer, please mention the general area or skill.";

    let prompt = "";
    let responseFormat = "";
    let responseType = queryType;

    if (queryType === "LEARNING_PATH") {
      // Learning path request
      prompt = `
        You are an expert learning path advisor. A user is seeking guidance to achieve a learning objective.
        Their primary query is: "${userQuery}"
        Their name is: ${userName}
        Their stated interests are: ${userInterests.length > 0 ? userInterests.join(', ') : 'None specified.'}
        Their stated goals are: ${userGoals.length > 0 ? userGoals.join(', ') : 'None specified.'}

        Context about our learning platform: ${courseContextForAI}
        Our courses have difficulty levels: Beginner, Intermediate, Advanced.

        Please generate a step-by-step learning path to help the user achieve their objective.
        The path should consist of 3 to 7 actionable steps.
        For each step, provide:
        1. A concise "title" for the step.
        2. A brief "description" (1-2 sentences) explaining the step's purpose or what to learn.
        3. A "type" field, which should be one of: "foundational_skill", "practical_application", "course_focus_area", or "further_exploration".

        VERY IMPORTANT: Respond ONLY with a valid JSON array of objects. Each object in the array represents a step and must have the keys "step" (a sequential number starting from 1), "title", "description", and "type".
        Do not include any introductory text, concluding remarks, markdown formatting (like \`\`\`json), or any other text outside of the JSON array itself.

        Example of a single step object:
        { "step": 1, "title": "Understand Core Programming Concepts", "description": "Begin by learning fundamental programming principles like variables, control flow, data structures, and algorithms. This is crucial before specializing.", "type": "foundational_skill" }
      `;
      
      responseFormat = "json";
    } else {
      // General question or doubt
      prompt = `
        You are an expert educational advisor and tutor for a learning platform.
        
        A user named ${userName} has asked: "${userQuery}"
        
        Their stated interests are: ${userInterests.length > 0 ? userInterests.join(', ') : 'None specified.'}
        Their stated goals are: ${userGoals.length > 0 ? userGoals.join(', ') : 'None specified.'}
        
        Context about our learning platform: ${courseContextForAI}
        
        Please provide a professional, helpful, and educational response to their question. Your response should:
        1. Be concise yet comprehensive (200-300 words)
        2. Include relevant educational concepts and terminology when appropriate
        3. Provide practical advice they can apply
        4. Suggest resources or approaches that might help them further
        5. Be encouraging and supportive
        
        Format your response with proper paragraphs. You may use markdown for text formatting like **bold** or *italic* if needed.
        
        IMPORTANT INSTRUCTIONS:
        - DO NOT format your response as a step-by-step learning path.
        - DO NOT use numbered steps or bullet points unless absolutely necessary to explain a concept.
        - DO NOT start with phrases like "Here is a learning path" or "Steps to learn".
        - DO use natural paragraphs and conversational tone.
        - Answer the specific question asked rather than providing a general guide.
        
        IMPORTANT: Respond with plain text directly. Do not use JSON formatting or add any prefix labels.
      `;
      
      responseFormat = "text";
    }

    console.log(`Sending to Gemini - User Query: "${userQuery}" as ${queryType}`);

    // Generate the response using Gemini
    console.log(`Sending to Gemini - User Query: "${userQuery}" classified as ${queryType}`);
    console.log(`Using response format: ${responseFormat}`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig, safetySettings });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = response.text();
    
    console.log(`Gemini Raw Response (first 100 chars): "${aiResponseText.substring(0, 100)}..."`);

    let processedResponse;
    let aiNotes = "AI response generated successfully.";
    
    if (responseFormat === "json") {
      // Process learning path JSON response
      try {
        let cleanedResponseText = aiResponseText.trim();
        if (cleanedResponseText.startsWith("```json")) {
          cleanedResponseText = cleanedResponseText.substring(7);
        }
        if (cleanedResponseText.endsWith("```")) {
          cleanedResponseText = cleanedResponseText.substring(0, cleanedResponseText.length - 3);
        }
        cleanedResponseText = cleanedResponseText.trim();

        processedResponse = JSON.parse(cleanedResponseText);

        if (!Array.isArray(processedResponse)) {
          console.error("Gemini response was not a JSON array after cleaning. Raw:", aiResponseText);
          throw new Error("AI response could not be parsed into a valid path array.");
        }
        
        processedResponse = processedResponse.map((item, index) => ({ 
            ...item, 
            step: index + 1,
            title: item.title || "Untitled Step",
            description: item.description || "No description provided.",
            type: item.type || "general_suggestion"
        }));
        
        aiNotes = "Learning path generated successfully by AI.";
        console.log(`Successfully processed JSON learning path with ${processedResponse.length} steps`);
      } catch (parseError) {
        console.error("Error parsing Gemini JSON response:", parseError.message);
        console.error("Problematic AI Response Text for parsing:", aiResponseText);
        
        // If we can't parse the JSON, try treating it as a general question response
        if (aiResponseText.length > 50 && !aiResponseText.includes("{") && !aiResponseText.includes("[")) {
          console.log("Response looks like text rather than JSON. Treating as general response instead.");
          responseFormat = "text";
          responseType = "GENERAL_QUESTION";
          processedResponse = aiResponseText.trim();
          aiNotes = "AI provided a text response instead of a learning path.";
        } else {
          aiNotes = "AI response received, but could not be fully structured. The AI suggested the following: ";
          processedResponse = [{ 
            step: 1, 
            title: "AI Suggestion (Processing Issue)", 
            description: aiResponseText.substring(0, 800) + (aiResponseText.length > 800 ? "..." : ""),
            type: "raw_ai_output" 
          }];
        }
      }
    } else {
      // Process general question text response
      processedResponse = aiResponseText.trim();
      aiNotes = "AI response to your question generated successfully.";
      console.log("Successfully processed text response");
    }

    res.json({
      userInput: {
          query: userQuery,
          interests: userInterests,
          goals: userGoals
      },
      responseType: responseType,
      suggestedPath: responseFormat === "json" ? processedResponse : null,
      generalResponse: responseFormat === "text" ? processedResponse : null,
      aiNotes
    });

  } catch (apiError) {
    console.error("Error calling Gemini API:", apiError.message, apiError.stack);
    const aiNotes = "Could not connect to the AI service or an unexpected error occurred.";
    const errorResponse = {
      userInput: {
          query: userQuery,
          interests: userInterests,
          goals: userGoals
      },
      responseType: "ERROR",
      suggestedPath: null,
      generalResponse: "I'm sorry, but I couldn't process your request at this time. Please try again later or contact support if the issue persists.",
      aiNotes
    };

    res.status(500).json(errorResponse);
  }
});

module.exports = {
  generateAiLearningPath,
};