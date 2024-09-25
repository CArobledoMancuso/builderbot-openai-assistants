export interface IHistory extends Document {
    clientPhone: string;
    content: string;
    type: string;
    chatbotNumber: string;
    createdAt: Date;
    updatedAt: Date;
    role: "user" | "assistant";
  }