"use client";

import { useChat } from "ai/react";
import { createFriendliAI } from "@friendliai/ai-provider";
import { convertToCoreMessages, streamText } from "ai";
import { useState } from "react";

export default function Chat() {
  const [token, setToken] = useState<string>("");

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      fetch: async (url, options) => {
        const body = JSON.parse(options?.body as string);

        const friendli = createFriendliAI({
          apiKey: body.token,
        });

        const result = await streamText({
          model: friendli("meta-llama-3.1-8b-instruct"),
          messages: convertToCoreMessages(body.messages),
        });
        return result.toDataStreamResponse();
      },
      onError: (error) => {
        console.error(error);
      },
      body: {
        token: token,
      },
    });

  const isWaiting =
    isLoading && messages[messages.length - 1]?.role !== "assistant";

  return (
    <>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste your token here"
      />

      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
      ))}

      {(isWaiting || error) &&
        (isWaiting
          ? "AI is thinking..."
          : error && "An error has occurred. Please try again later.")}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
