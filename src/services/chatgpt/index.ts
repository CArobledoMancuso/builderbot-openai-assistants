import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import dotenv from "dotenv";
import { IHistory } from "~/history/entity/history.entity";

dotenv.config();

export class AiService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    this.openai = new OpenAI({ apiKey, timeout: 15 * 1000 });
    if (!apiKey || apiKey.length === 0) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    this.model = model;
  }

  /**
   *
   * @param messages
   * @param model
   * @param temperature
   * @returns
   */
  async createChat(
    messages: ChatCompletionMessageParam[],
    model?: string,
    temperature = 0
  ) {
    if (!messages || messages.length === 0) {
      throw new Error("No messages provided");
    }
  
    try {
      const completion = await this.openai.chat.completions.create({
        model: model ?? this.model,
        messages,
        temperature,
        max_tokens: 1500,
        top_p: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.error("Error creating chat:", err);
      return "ERROR";
    }
  }

  async createSystemChat(
    prompt: string,
    model?: string,
    temperature?: number
  ): Promise<string> {
    const response = await this.createChat(
      [
        {
          role: "system",
          content: prompt,
        },
      ],
      model,
      temperature
    );
    return response;
  }

  async createCoversation(
    history: IHistory[],
    prompt: string,
    model?: string
  ): Promise<string> {
    history = history.reverse();
    const conversationArray: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: prompt,
      },
    ];
    history.forEach((message) => {
      const iaMessage = {
        role: message.role,
        content: message.content,
      };
      conversationArray.push(iaMessage);
    });
    const response = await this.createChat(conversationArray, model);
    return response;
  }
}