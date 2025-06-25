export interface User {
    id: string;
    username: string;
    email: string;
}

export interface Message {
    id: string;
    senderId: string;
    recipientId?: string; 
    groupId?: string;
    content: string;
    timestamp: Date;
}

export interface Group {
    id: string;
    name: string;
    members: User[];
}

export interface Chat {
    id: string;
    participants: User[];
    messages: Message[];
}

export interface ChatMessage {
    id: number;
    content: string;
    authorId: number;
    chatGroupId: number;
    sent_at: Date;
    attached_image?: string;
}