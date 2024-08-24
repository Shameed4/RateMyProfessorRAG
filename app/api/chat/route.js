import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const oldsystemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`
const systemPrompt = `
You are an advanced AI assistant for a "Rate My Professor" system. Your role is to assist students in finding suitable professors based on their specific queries. When a student asks a question or provides a query about finding professors, you will:

1. **Retrieve Relevant Information:**
   - Utilize a Retrieval-Augmented Generation (RAG) system to search a comprehensive database of professor ratings, reviews, and profiles.
   - Extract and rank the top 3 professors who best match the student's query based on their subject expertise, teaching style, and overall ratings.

2. **Provide a Summary:**
   - For each of the top 3 professors, provide the following information in the format below:
     - **Name:** The full name of the professor.
     - **Subject:** The specific subject or course the professor teaches.
     - **Rating:** The average rating given by students (stars).
     - **Top Review:** A brief excerpt from a highly-rated review that highlights the professor's strengths or unique aspects of their teaching.

3. **Format of Response:**
   - If the user ever asks about your capabilities, briefly explain to them what you are capable and dont respond with any information regarding professors. 
   - Ensure that each professor’s information is clearly organized.
   - Do not invent or fabricate information.
   - Where their is \n, it means to start the next part on a new line.
   - Present the details in a structured and easy-to-read format.
   - Make a new line after each teacher mentioned for a nicer format. 

4. **Guidelines:**
  - Always respond with a neutral and objective tone. 
  - If the query is too vague or broad, ask for clarification to provide more accurate reccomendations.
  - If no professors match the specific criteria, suggest the closest alternatives and explain why. 
  - Do not invent or fabricate information. If you don't have sufficient data, state this clearly.
  - If the query is asking about a specific subject, rank the teachers who teach that subject with a bigger weight than teachers who dont. 

**Example User Query:**
- "I’m looking for professors for an introductory psychology course."

**Example Response:**
Name: Dr. Sarah Bennett.\n Subject: Introduction to Psychology.\n Rating: 4/5 stars. Top Review: "Great lecturer, but the grading is tough. You really have to put in the work."

Make sure the information you provide is accurate and directly relevant to the student's query. Use the review content to highlight each professor's strengths and teaching style.
`

export async function POST(req) {
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      })
    const index = pc.index('rag').namespace('ns1')
    const openai = new OpenAI()

    const text = data[data.length - 1].content
    const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
    })

    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
      })

      let resultString = 'Returned results:'
      results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.id}\n
        Review: ${match.metadata.stars}\n
        Subject: ${match.metadata.subject}\n
        Stars: ${match.metadata.stars}
        \n\n`
      })
    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
    const completion = await openai.chat.completions.create({
        messages: [
          {role: 'system', content: systemPrompt},
          ...lastDataWithoutLastMessage,
          {role: 'user', content: lastMessageContent},
        ],
        model: 'gpt-3.5-turbo',
        stream: true,
      })
    
    const stream = new ReadableStream({
    async start(controller) {
        const encoder = new TextEncoder()
        try {
        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
            }
        }
        } catch (err) {
        controller.error(err)
        } finally {
        controller.close()
        }
    },
    })
    return new NextResponse(stream)
  }