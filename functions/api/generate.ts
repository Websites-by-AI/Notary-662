// This is a Cloudflare Pages Function that acts as a serverless backend.
// It will be deployed automatically when placed in the /functions directory.

interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
    try {
        const { model, stream, contents, config } = await context.request.json() as {
            model: string;
            stream: boolean;
            contents: any; // Can be a string for simple prompts or an array for chat
            config: any;
        };
        
        const requestBody: any = {
            // The 'contents' from the client is already in the correct format 
            // (e.g., [{ parts: [{ text: "..." }] }] or a full chat history array)
            contents: contents,
        };

        if (config) {
            if (config.tools) {
                requestBody.tools = config.tools;
            }
            
            const generationConfig: any = {};
            if (config.temperature) generationConfig.temperature = config.temperature;
            if (config.topK) generationConfig.topK = config.topK;
            if (config.topP) generationConfig.topP = config.topP;
            if (config.maxOutputTokens) generationConfig.maxOutputTokens = config.maxOutputTokens;
            if (config.responseMimeType) generationConfig.responseMimeType = config.responseMimeType;
            if (config.responseSchema) generationConfig.responseSchema = config.responseSchema;
            
            if (Object.keys(generationConfig).length > 0) {
              requestBody.generationConfig = generationConfig;
            }

            if (config.systemInstruction) {
                requestBody.systemInstruction = { parts: [{ text: config.systemInstruction }] };
            }
        }

        const method = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`;

        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': context.env.GEMINI_API_KEY, 
            },
            body: JSON.stringify(requestBody),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            return new Response(errorBody, { status: geminiResponse.status, headers: { 'Content-Type': 'application/json' } });
        }
        
        if (!stream) {
            const responseJson = await geminiResponse.json();
            const text = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const enhancedResponse = { ...responseJson, text };
            
            return new Response(JSON.stringify(enhancedResponse), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const responseHeaders = new Headers(geminiResponse.headers);
        responseHeaders.set('Cache-Control', 'no-cache');
        
        return new Response(geminiResponse.body, {
            status: geminiResponse.status,
            headers: responseHeaders,
        });

    } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        return new Response(JSON.stringify({ error: { message: `Proxy Error: ${error.message}` } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
