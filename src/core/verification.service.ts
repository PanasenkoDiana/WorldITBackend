import { EmailService } from './email.service';

interface VerificationRecord {
    user: any;
    code: string;
    expiresAt: number;
}

export class VerificationService {
    private storage: Map<string, VerificationRecord>;
    private emailService: typeof EmailService;

    constructor(emailService: typeof EmailService) {
        this.storage = new Map();
        this.emailService = emailService;
    }

    async generateAndSendCode(email: string, user: any): Promise<boolean> {
        const code = this.emailService.generateCode(6);
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        console.log(`email: ${email}, code: ${code}`);
        this.storage.set(email, { user, code, expiresAt });
        console.log('storage: '+ JSON.stringify(this.storage.get(email)))
        return await this.emailService.sendVerifyMail(email, code);
    }

    verifyCode(email: string, code: string): any | null {
        const record = this.storage.get(email);
        if (!record) return null;
        if (record.expiresAt < Date.now()) {
            this.storage.delete(email);
            return null;
        }
        if (record.code !== code) return null;

        this.storage.delete(email);
        return record.user;
    }
}
