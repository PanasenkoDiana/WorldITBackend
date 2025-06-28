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

export interface CreateMessage {
    content: string;
    senderId: number;
    groupId: string;
}

export interface Group {
    id: string;
    name: string;
    members: User[];
}

export interface CreateGroup {
    name: string;
    members: number[];
    avatar: string
}



export interface ReceiveGroupMessage {
    
}