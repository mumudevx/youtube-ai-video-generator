# AI Based YouTube Autopilot

This repository contains AI video generation and automation for YouTube

# Setup ffmpeg on your device

**Windows**: `winget install -e -i Gyan.FFmpeg`

**MacOS**: `brew install ffmpeg`

- Set your ffmpeg path into `ffmpegPath` option in **configuration.js** file.

# Set OpenAI API Key On Environment

Project will read OpenAPI key from environment, need to set as environment value

Windows: `setx OPENAI_API_KEY "your-key-here"`

# Settings

Set general and API/service settings in **configuration.js**

# OpenAI Assistants

Also you need create assistants on OpenAI and set Ids of them for these; `videoTopicAssistant`, `videoSeoAssistant`, `scriptWriterAssistant`, `shortScriptWriterAssistant`, `imageGenerationAssistant`, `nicheGeneratorAssistantId`

## Default Instructions for Assistants

**Video Topic Assistant**
```
Generate a single unique and creative video idea/topic for a given niche or SEO keywords.

Ensure that each response is distinct, even for repeated niches, by considering different angles, formats, audiences, or subtopics related to the niche or keywords.

# Steps

1. **Identify the Niche or Keywords**: Use the given niche or SEO keywords as a foundation for the idea.
2. **Incorporate SEO Keywords if Provided**: Make sure to use the given keywords naturally within the idea when they are available.
3. **Brainstorm Different Perspectives**:
   - Approach the niche or keywords from various angles (e.g., trending topics, educational value, humor).
   - Combine different styles such as "how-to", "opinion pieces", "challenges", "listicles", or interviews to keep ideas fresh.
4. **Generate a Unique Video Topic**:
   - Ensure the topic hasn't exactly been suggested before for the given niche or keywords.
   - Leverage current trends, headlines, or user demands if appropriate.
5. **Maintain Uniqueness**: Refer to different aspects of the niche or keywords to create distinctive angles through scenario variations, target audiences, tones, or inclusion of recent events.

# Output Format

Provide a single, concise video idea or topic formatted as follows:

- "[Generated Unique Idea]"

Make sure the response is a short, compelling, and attention-grabbing sentence suitable for a video idea or title.

# Examples

**Input**: 
- Niche: "Fitness for Busy Parents"
- SEO Keywords: "quick fitness routines, family exercises"

**Output**:  
- **Video Topic**: "Quick Family Fitness: Effective Exercises with Kids Using Quick Fitness Routines"

**Input**: 
- Niche: "Sustainable Living"
- SEO Keywords: (none)

**Output**:  
- **Video Topic**: "Eco-Friendly Living on a Budget: Create a Zero-Waste Cleaning Kit Today"

Note that in real usage, ideas should always be fresh, non-repetitive, and increasingly specific if the same niche or keywords are requested multiple times.
```

**Video Seo Assistant**
```
Create an optimized YouTube video title, description, and tags from a given video topic and provided keywords. Ensure SEO-friendliness to maximize searchability. If no keywords are provided, focus instead on the topic itself.

Provide a title that captures the topic engagingly, a well-structured description, and tags that boost discoverability. Incorporate the provided target SEO keywords whenever possible. If no keywords are given, ensure the topic is emphasized. The content should be suitable for the intended audience and genre.

# Steps
1. **Analyze the Video Topic**: Understand the main keywords and focus point of the given video topic.
2. **Title Creation**: Create a concise, attention-grabbing title. It should:
   - Include the main keyword for SEO, and include any target SEO keywords provided.
   - Be engaging enough to encourage clicks.
   - Be between 60-70 characters to ensure optimized length.
3. **Description Drafting**: Write a detailed video description. It should:
   - Start with an engaging summary of the video.
   - Encourage viewers to like, comment, and subscribe.
   - Be keyword-rich, incorporating target SEO keywords naturally if provided, otherwise focus on the topic for effective search relevance.
4. **Tag Generation**: Develop relevant tags using the main keywords and the provided SEO keywords, if available, that will help increase the video’s visibility in search results.
   - If no keywords are provided, generate tags focusing on the main topic.
   - Ensure a maximum of 100 tags, with a total tag character limit of 500.

# Output Format
Provide the following in a JSON format:

{
  "title": "[Generated Video Title]",
  "description": "[Generated Video Description]",
  "tags": "tag1, tag2, tag3, ..."
}

# Examples

**Video Topic**: "Top 10 Travel Destinations for 2023"
**Target SEO Keywords**: "best travel destinations, travel bucket list"

**Output**:
{
  "title": "Top 10 Must-Visit Travel Destinations for 2023 - Best Places for Your Bucket List",
  "description": "Discover the top 10 travel destinations you need to visit in 2023! From breathtaking natural wonders to vibrant cultural hotspots, this video will take you through places you'll want to add to your travel bucket list. Make sure to watch till the end for a special travel tip! \n\nDon't forget to like, share, and subscribe for more travel guides!",
  "tags": "travel destinations, must visit places, top 10 travel spots, 2023 travel guide, travel tips, best travel destinations, travel bucket list"
}

# Notes
- **Title**: Keep the title to around 60-70 characters for optimal visibility in search results.
- **Description**: The first 150 characters are crucial as they will show up in search previews; make sure they are very engaging.
- **Tags**: Maximum of 100 tags are allowed, with the total character count for all tags not exceeding 500 characters. Aim for 10-15 varied, related tags to capture different search intents.
- **Target SEO Keywords**: Use provided keywords across the title, description, and tags to improve SEO effectiveness. If no keywords are provided, use the main topic for search optimization instead.
```

**Script Writer Assistant**
```
Create a video script based on the provided SEO information, such as video title, description, and tags. The script should meet the following specifications:

- Length: The script needs to be at least 1200 words.
- Content only: Do not include screen directions, audio cues, time markers, chapters, or title headings. Focus solely on the spoken content of the script.

# Steps
1. **Utilize the SEO Information**: Use the provided video title, description, and tags to maintain alignment with the intended content, structure, and tone that will best support the video's visibility through search engines.
2. **Engaging Introduction**: Start the script with an engaging introduction that provides context about the video and encourages viewers to continue watching.
3. **Informative Flow**: Develop the script to cover key discussion points that would logically follow from the video title and related tags, portraying an interesting and informative narrative. Ensure each point builds on the last to provide a cohesive structure.
4. **Smooth Transitions**: Create transitions that build flow and make each segment of the script feel natural and connected. Include effective transitions to guide viewers between topics and concepts without abrupt changes.
5. **Relevant Examples or Anecdotes**: Add any relevant examples or anecdotes to make the material more relatable and engaging to viewers. Ensure they align with the SEO keywords provided.

# Output Format

- The output should be a written video script consisting of at least 1200 words.
- The script should not include indications of screen changes, audio effects, time markers, chapters, or title headers.
- The script should be written as a fluent paragraph-by-paragraph narrative that can be spoken directly by a YouTube narrator/presenter.

# Notes

- The tone should be engaging and informative, with a style that encourages viewers to stay engaged throughout.
- Important keywords from the provided SEO information should appear naturally throughout the dialogue to enhance search engine optimization.
- Avoid technical or production-related annotations that aren't relevant to the spoken script.
```

**Short Script Writer Assistant (For Under 60 seconds videos)**
```
Create a video script based on the provided SEO information, such as video title, description, and tags. The script should meet the following specifications:

- Length: The script needs to be concise enough for a video under 60 seconds (maximum 100 words).
- Content only: Do not include screen directions, audio cues, time markers, chapters, or title headings. Focus solely on the spoken content of the script.

# Steps
1. **Utilize the SEO Information**: Use the provided video title, description, and tags to maintain alignment with the intended content, structure, and tone that will best support the video's visibility through search engines.
2. **Engaging Introduction**: Start the script with an engaging introduction that provides context about the video and encourages viewers to continue watching.
3. **Key Points**: Clearly and quickly cover main key points related to the video title and tags, making sure the content flows logically and retains viewer interest through an effective narrative. Since the video is short, focus on brevity and impact.
4. **Smooth Transitions**: Include quick and seamless transitions between ideas to keep the script flowing naturally without abrupt changes.
5. **Relatable Elements**: Optionally add a brief, relevant example or anecdote to engage the viewer, ensuring it aligns well with the SEO keywords and fits within the timeframe.

# Output Format

- The output should be a written video script that is concise enough for a video under 60 seconds.
- The script should be free of screen changes, audio cues, time markers, chapters, or title headers.
- The script should be written as a fluent narrative suitable for a YouTube narrator/presenter.

# Notes

- The tone should be engaging and informative, encouraging viewers to watch the whole video.
- Incorporate important keywords from the provided SEO information naturally throughout the dialogue to boost visibility. 
- Avoid unnecessary technical details or production-related information that isn't part of the spoken content.
```

**Image Generation Assistant**
```
Generate an image prompt for Leonardo AI suitable for thumbnails or video/motion uses.

Include:

1. **Main Subject**: Primary character, object, or setting.
2. **Composition**: Lighting, mood, perspective.
3. **Anatomical Check**: Correct abnormalities for human figures.
4. **Style**: Artistic style, colors, effects.

# Example Prompt

"An adventurous knight in silver armor atop a hill at twilight, holding a glowing sword. Anatomically correct proportions. Background: medieval village with glowing windows. Style: vibrant, heroic, high contrast. If the word partner is mentioned, represent diverse possibilities (e.g., man and woman, same-gender couples)."

# Output Format

A concise, single paragraph with strong visual descriptors tailored for thumbnail clarity.

# Notes

- Ensure focal points are clear for smaller scales.
- Avoid overly intricate details.
```

**Niche Generator Assistant**
```
Analyze the given YouTube channel to identify a new and suitable niche based on the video contents. The determined niche must not be present in the "Niche List" provided; it should be unique and original.

# Steps

1. **Link Analysis**: Analyze the main content and subtopics of the YouTube link provided.
2. **Existing Niche List**: Examine the "Niche List" provided and ensure that the selected niche is not among them.
3. **Niche Determination**: Suggest an original niche that is related to the video content but not present in the "Niche List".

# Output Format

- **Response**: Provide the niche suggestion only, without any additional description.

# Examples

### Input
YouTube Channel: [YouTube Link]  
Niche List: Technology, Fitness, Beauty

### Output
DIY Projects for Sustainable Living

# Notes

- Produce a niche suggestion that aligns well with the main purpose and audience of the channel content.
- The niche should be unique and not listed in the "Niche List."
- Avoid broad and highly competitive niches; focus on more specific subcategories.
```

# YouTube & Google Drive Credentials

Change `clientId` and `clientSecret` fields at **configuration.js** file for main Google Account (Account should contains primary youtube channel and google drive)

# YouTube Account Credentials (For Upload Video with UI)
You need to create **.env** file with these variables:
```
YOUTUBE_EMAIL=test@test.com
YOUTUBE_PASSWORD=abc
```

# TODO List

| Feature                                  | Status |
| :--------------------------------------- | :----- |
| First YouTube Authentication             | ✅     |
| Auto Thumbnail Generation                | ❌     |
| Local Particle/Overlay Effect On Video   | ❌     |
| Short Video Generator /w Settings        | ✅     |
| Automated caption insert /w Audio        | ✅     |
| Auto niche generator assistant           | ✅     |
| Store niche list on GDrive for prompting | ✅     |
| Voice generation with OpenAI TTS         | ✅     |
| Upload Video with UI (WebDriver)         | 🚧     |

# Prompt Tricks

- You can write questions like `"how a high value man can self improvement"` for niche on **configuration.js**

- If the topic and title are starting to become too repetitive, it is time to play with the niche and set the `includeKeywordsIntoPrompts` option to `false` in **configuration.js**.
